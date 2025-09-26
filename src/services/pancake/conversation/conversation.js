import PancakeClient from "pancake/pancake-client";
import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";
import AIHUBClient from "services/clients/aihub";

export default class ConversationService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.leadService = new LeadService(env);
    this.db = Database.instance(env, "neon");
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
      console.error(error);
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
      console.error(error);
      return undefined;
    }
  }

  async processLastCustomerMessage(body) {
    try {
      const message = body?.data?.message;
      if (!message) {
        console.warn(`No message found in data: ${JSON.stringify(body?.data)}`);
        return;
      }

      const from = body?.data?.message?.from;
      if (from?.admin_id) {
        return;
      }

      // Ignore if it is not messaging
      if (body?.event_type !== "messaging") {
        return;
      }

      const conversationId = message.conversation_id;
      const pageId = message.page_id;
      const insertedAt = message.inserted_at;

      if (!conversationId || !pageId || !insertedAt) {
        throw new Error("Page ID: " + pageId + ", Conversation ID: " + conversationId + ", Inserted At: " + insertedAt);
      }
      // Store the time of the last customer message
      const result = await this.updateConversation(conversationId, pageId, insertedAt);
      return result;
    } catch (err){
      console.error(`processLastCustomerMessage failed: ${err}`);
      return;
    }
  }

  async syncCustomerToLeadCrm(body) {
    try {
      const adminId = body?.data?.message?.from?.admin_id;
      // Ignore message from admin
      if (adminId) {
        return;
      }

      // Ignore if it is not messaging
      if (body?.event_type !== "messaging") {
        return;
      }

      const conversationId = body?.data?.conversation?.id;
      if (!conversationId || conversationId.trim() === "") {
        return;
      }

      const pageId = body?.page_id;
      if (!pageId || pageId.trim() === "") {
        return;
      }

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
        await this.leadService.updateLead({
          leadName: existingDocName.frappe_name_id,
          phone: body?.data?.message?.phone_info?.[0].phone_number ?? "",
          firstName: body?.data?.conversation?.from?.name ?? ""
        });
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

        if (newLead !== undefined && newLead !== null && newLead.length > 0) {
          frappeNameId = newLead[0];
        }
      }

      if (frappeNameId !== undefined && frappeNameId !== null) {
        await this.upsertFrappeLeadConversation(conversationId, frappeNameId);
      }
    } catch (error) {
      console.error(`syncCustomerToLeadCrm failed: ${error}`);
      return;
    }
  }

  async summarizeLead(env, body) {
    // Skip if webhook's event_type is not "messaging"
    if (body?.event_type !== "messaging") {
      return;
    }

    const { data } = body;
    const { message } = data;

    // Skip if the message is from admin
    if (message?.from?.admin_id) { return; }

    const conversationId = message?.conversation_id;

    if (!conversationId) { return; }

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

  static async dequeueMessageSummaryQueue(batch, env) {
    const conversationService = new ConversationService(env);
    const messages = batch.messages;

    for (const message of messages) {
      const body = message.body;

      await conversationService.summarizeLead(env, body).catch(err =>
        console.error(`summarizeLead failed: ${err}`)
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
      await conversationService.syncCustomerToLeadCrm(body);
    }
  }
}
