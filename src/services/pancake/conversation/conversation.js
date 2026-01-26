import * as Sentry from "@sentry/cloudflare";
import PancakeClient from "pancake/pancake-client";
import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";
import AIHUBClient from "services/clients/aihub";
import { shouldReceiveWebhook } from "controllers/webhook/pancake/erp/utils";
import { EXTRA_HOOKS } from "services/pancake/constants/extra-hook.constant";

export default class ConversationService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.leadService = new LeadService(env);
    this.db = Database.instance(env);
  }

  async updateConversation(conversationId, pageId, insertedAt) {
    const result = await this.db.$queryRaw`
      UPDATE pancake.conversation c
      SET last_sent_at = ${insertedAt}
      WHERE c.id = ${conversationId} AND c.page_id = ${pageId};
    `;
    return result;
  }

  async upsertFrappeLeadConversation(
    conversationId,
    frappeNameId
  ) {
    const result = await this.db.$queryRaw`
      INSERT INTO pancake.frappe_lead_conversation (conversation_id, frappe_name_id, updated_at, created_at)
      VALUES (${conversationId}, ${frappeNameId}, NOW(), NOW())
      ON CONFLICT (conversation_id) DO UPDATE SET
        frappe_name_id = EXCLUDED.frappe_name_id,
        updated_at = NOW();
    `;
    return result;
  }

  async findExistingLead({
    conversationId
  }) {
    try {
      const result = await this.db.$queryRaw`
        SELECT * FROM pancake.frappe_lead_conversation AS flc
        WHERE flc.conversation_id = ${conversationId}
        LIMIT 1;
      `;
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return undefined;
    }
  }

  async findPageInfo({
    pageId
  }) {
    try {
      const result = await this.db.$queryRaw`
        SELECT * FROM pancake.page AS p
        WHERE p.id = ${pageId}
        LIMIT 1;
      `;
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return undefined;
    }
  }

  async processLastCustomerMessage(body) {
    try {
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

      if (!insertedAt) {
        throw new Error("Page ID: " + pageId + ", Conversation ID: " + conversationId + ", Inserted At: " + insertedAt);
      }
      // Store the time of the last customer message
      const result = await this.updateConversation(conversationId, pageId, insertedAt);
      return result;
    } catch (err){
      Sentry.captureException(err);
      return;
    }
  }

  async syncCustomerToLeadCrm(body) {
    try {
      const receiveWebhook = shouldReceiveWebhook(body);

      if (!receiveWebhook) {
        return;
      }

      const conversationId = body?.data?.conversation?.id;

      const pageId = body?.page_id;

      const hasPhone = body?.data?.message?.has_phone;
      if (hasPhone === undefined || hasPhone === false) {
        return;
      }

      const existingDocName = await this.findExistingLead({
        conversationId: conversationId
      });
      if (existingDocName === undefined) return;

      let frappeNameId;
      if (existingDocName !== null) {
        frappeNameId = existingDocName.frappe_name_id;
        const leads = await this.leadService.updateLead({
          leadName: existingDocName.frappe_name_id,
          phone: body?.data?.message?.phone_info?.[0].phone_number ?? "",
          firstName: body?.data?.conversation?.from?.name ?? ""
        });
        if (leads?.results && Array.isArray(leads.results) && leads.results.length > 0) {
          frappeNameId = leads.results[0]?.name;
        }
      } else {
        const pancakePage = await this.findPageInfo({
          pageId: pageId
        });
        if (pancakePage === undefined || pancakePage === null) return;

        const newLead = await this.leadService.insertLead({
          firstName: body?.data?.conversation?.from?.name ?? "",
          phone: body?.data?.message?.phone_info?.[0].phone_number ?? "",
          platform: pancakePage.platform ?? "",
          conversationId: conversationId ?? "",
          customerId: "",
          pageId: pageId,
          pageName: pancakePage.name ?? "",
          insertedAt: "",
          updatedAt: "",
          type: body?.data?.conversation?.type ?? "",
          lastestMessageAt: "",
          pancakeUserId: body?.data?.conversation?.assignee_ids?.[0] ?? "",
          pancakeAvatarUrl: ""
        });

        if (newLead !== undefined && newLead !== null && Array.isArray(newLead) && newLead.length > 0) {
          frappeNameId = newLead[0]?.name;
        }
      }

      if (frappeNameId !== undefined && frappeNameId !== null) {
        await this.upsertFrappeLeadConversation(conversationId, frappeNameId);
      }
    } catch (error) {
      Sentry.captureException(error);
      return;
    }
  }

  async summarizeLead(env, body) {
    const receiveWebhook = shouldReceiveWebhook(body);

    if (!receiveWebhook) {
      return;
    }

    const { data } = body;
    const { message } = data;

    const conversationId = message?.conversation_id;

    const existingDocName = await this.findExistingLead({
      conversationId: conversationId
    });

    if (!existingDocName) return;

    const aihub = new AIHUBClient(env);
    return await aihub.makeRequest("/lead-info", {
      "pageId": body.page_id,
      "conversationId": conversationId,
      "webhookUrl": `${env.HOST}/webhook/ai-hub/erp/leads`
    });
  }

  async triggerExtraHooks(body) {
    const promises = EXTRA_HOOKS.map(url =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).catch(err => {
        console.warn(`Failed to forward webhook to ${url}:`, err);
        Sentry.captureException(err);
      })
    );

    await Promise.allSettled(promises);
  }

  static async dequeueMessageSummaryQueue(batch, env) {
    const conversationService = new ConversationService(env);
    const messages = batch.messages;

    for (const message of messages) {
      const body = message.body;

      await conversationService.summarizeLead(env, body).catch(err =>
        Sentry.captureException(err)
      );
    }
  }

  static async dequeueMessageQueue(batch, env) {
    const conversationService = new ConversationService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const body = message.body;
      await conversationService.processLastCustomerMessage(body);
    }
  }

  static async dequeueMessageSyncCustomerToLeadCRM(batch, env) {
    const conversationService = new ConversationService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const body = message.body;
      await Promise.all([
        conversationService.syncCustomerToLeadCrm(body),
        conversationService.triggerExtraHooks(body)
      ]);
    }
  }
}
