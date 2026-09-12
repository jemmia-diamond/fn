import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { shouldReceiveWebhook } from "controllers/webhook/pancake/erp/utils";
import PancakeClient from "pancake/pancake-client";
import AIHUBClient from "services/clients/aihub";
import CustomerLensClient from "services/customer-lens-client";
import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";
import { PancakeCache } from "services/pancake/conversation/pancakeCache";
import { getSalesayaScoringWebhookUrl } from "services/salesaya/constants/constant";
import { createAxiosClient } from "services/utils/http-client";

dayjs.extend(utc);

export default class ConversationService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env);
    this.leadService = new LeadService(env);
    this.db = Database.instance(env);
    this.customerLensClient = CustomerLensClient.instance(env);
  }

  async updateConversation(conversationId, pageId, insertedAt) {
    if (!conversationId || !pageId || !insertedAt) return null;
    const at = dayjs.utc(insertedAt).toDate();
    return this.db.conversation.updateMany({
      where: { id: conversationId, page_id: pageId },
      data: { last_sent_at: at, last_customer_message_at: at }
    });
  }

  async updateLastSalesMessageAt(conversationId, pageId, insertedAt) {
    if (!conversationId || !pageId || !insertedAt) return null;
    return this.db.conversation.updateMany({
      where: { id: conversationId, page_id: pageId },
      data: { last_sales_message_at: dayjs.utc(insertedAt).toDate() }
    });
  }

  async findPageInfo({ pageId }) {
    if (!pageId) return null;
    return this.db.page.findFirst({ where: { id: pageId } });
  }

  async processLastCustomerMessage(body) {
    const receiveWebhook = shouldReceiveWebhook(body);

    if (!receiveWebhook) {
      return;
    }

    const message = body?.data?.message;
    if (!message) {
      console.warn(`No message found in data: ${JSON.stringify(body?.data)}`);
      return;
    }

    const conversationId = message.conversation_id;
    const pageId = message.page_id;
    const insertedAt = message.inserted_at;

    if (!insertedAt || !conversationId || !pageId) {
      console.warn(
        "Missing required fields for processLastCustomerMessage. Page ID: " +
          pageId +
          ", Conversation ID: " +
          conversationId +
          ", Inserted At: " +
          insertedAt
      );
      return;
    }
    await this.updateConversation(conversationId, pageId, insertedAt);

    const frappeNameId =
      await this.leadService.getLeadNameByConversationId(conversationId);
    if (frappeNameId) {
      await this.leadService.updateLeadLastMessage({
        frappeNameId,
        lastCustomerMessageAt: insertedAt
      });
    }
  }

  async processSalesMessage(body) {
    const message = body?.data?.message;
    const conversationId = body?.data?.conversation?.id;
    const pageId = message?.page_id || body?.page_id;
    const insertedAt = message?.inserted_at;

    if (!insertedAt || !conversationId || !pageId) {
      return;
    }

    await this.updateLastSalesMessageAt(conversationId, pageId, insertedAt);

    const frappeNameId =
      await this.leadService.getLeadNameByConversationId(conversationId);
    if (frappeNameId) {
      await this.leadService.updateLeadLastMessage({
        frappeNameId,
        lastSalesMessageAt: insertedAt
      });
    }
  }

  async syncCustomerToLeadCrm(body) {
    const receiveWebhook = shouldReceiveWebhook(body);

    if (!receiveWebhook) {
      return;
    }

    const conversationId = body?.data?.conversation?.id;

    const pageId = body?.page_id;

    const hasPhone = body?.data?.message?.has_phone;
    if (!hasPhone || !conversationId || !pageId) {
      return;
    }

    const pancakePage = await this.findPageInfo({
      pageId: pageId
    });
    if (pancakePage === null) return;

    await this.leadService.updateLead({
      customerPhone: body?.data?.message?.phone_info?.[0]?.phone_number ?? "",
      customerName: body?.data?.conversation?.from?.name ?? "",
      platform: pancakePage.platform ?? "",
      conversationId: conversationId ?? "",
      pageId: pageId,
      pageName: pancakePage.name ?? "",
      type: body?.data?.conversation?.type ?? "",
      pancakeUserId: body?.data?.conversation?.assignee_ids?.[0] ?? ""
    });
  }

  async summarizeLead(env, body) {
    const receiveWebhook = shouldReceiveWebhook(body);

    if (!receiveWebhook) {
      return;
    }

    const data = body?.data;
    const message = data?.message;

    const conversationId = message?.conversation_id;
    if (!conversationId) return;

    const frappeNameId =
      await this.leadService.getLeadNameByConversationId(conversationId);

    if (!frappeNameId) return;

    const aihub = new AIHUBClient(env);
    return await aihub.makeRequest("/lead-info", {
      pageId: body.page_id,
      conversationId: conversationId,
      webhookUrl: `${env.HOST}/webhook/ai-hub/erp/leads`
    });
  }

  async sendToCustomerLens(data) {
    const pageId = data?.page_id;
    const conversationId = data?.data?.conversation?.id;
    if (!pageId || !conversationId) return;
    const globalId = await PancakeCache.getMessageGlobalId(
      this.pancakeClient,
      pageId,
      conversationId,
      this.env
    );
    if (!globalId) {
      return;
    }

    await this.customerLensClient.post("/api/profile", {
      global_id: globalId,
      is_force: false
    });
  }

  async triggerSalesayaScoringHooks(body) {
    await createAxiosClient({}).post(
      getSalesayaScoringWebhookUrl(this.env),
      body
    );
  }

  static async dequeueMessageSummaryQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.summarizeLead(env, message.body);
    }
  }

  static async dequeueMessageLastCustomerQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.processLastCustomerMessage(message.body);
    }
  }

  static async dequeueSalesMessageQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.processSalesMessage(message.body);
    }
  }

  static async dequeueMessageSyncCustomerToLeadCRM(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.syncCustomerToLeadCrm(message.body);
    }
  }

  static async dequeueExtraHooksQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.triggerSalesayaScoringHooks(message.body);
    }
  }

  static async dequeueMessageCustomerLensQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.sendToCustomerLens(message.body);
    }
  }
}
