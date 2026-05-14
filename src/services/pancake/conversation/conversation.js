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
    const result = await this.db.$queryRaw`
      SELECT * FROM pancake.frappe_lead_conversation AS flc
      WHERE flc.conversation_id = ${conversationId}
      LIMIT 1;
    `;
    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  }

  async findPageInfo({
    pageId
  }) {
    const result = await this.db.$queryRaw`
      SELECT * FROM pancake.page AS p
      WHERE p.id = ${pageId}
      LIMIT 1;
    `;
    if (result && result.length > 0) {
      return result[0];
    }
    return null;
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

    if (!insertedAt) {
      throw new Error("Page ID: " + pageId + ", Conversation ID: " + conversationId + ", Inserted At: " + insertedAt);
    }
    // Store the time of the last customer message
    const result = await this.updateConversation(conversationId, pageId, insertedAt);
    return result;
  }

  async syncCustomerToLeadCrm(body) {
    const receiveWebhook = shouldReceiveWebhook(body);

    if (!receiveWebhook) {
      return;
    }

    const conversationId = body?.data?.conversation?.id;

    const pageId = body?.page_id;

    const hasPhone = body?.data?.message?.has_phone;
    if (!hasPhone) {
      return;
    }

    const existingDocName = await this.findExistingLead({
      conversationId: conversationId
    });

    const pancakePage = await this.findPageInfo({
      pageId: pageId
    });
    if (pancakePage === null) return;

    let frappeNameId;
    if (existingDocName !== null) {
      frappeNameId = existingDocName.frappe_name_id;

      const lead = await this.leadService.updateLead({
        frappeNameId: existingDocName.frappe_name_id,
        customerPhone: body?.data?.message?.phone_info?.[0]?.phone_number ?? "",
        customerName: body?.data?.conversation?.from?.name ?? "",
        platform: pancakePage.platform ?? "",
        conversationId: conversationId ?? "",
        pageId: pageId,
        pageName: pancakePage.name ?? "",
        type: body?.data?.conversation?.type ?? "",
        pancakeUserId: body?.data?.conversation?.assignee_ids?.[0] ?? ""
      });
      if (lead) {
        frappeNameId = lead.name;
      }
    } else {
      const newLead = await this.leadService.insertLead({
        customerName: body?.data?.conversation?.from?.name ?? "",
        customerPhone: body?.data?.message?.phone_info?.[0].phone_number ?? "",
        platform: pancakePage.platform ?? "",
        conversationId: conversationId ?? "",
        pageId: pageId,
        pageName: pancakePage.name ?? "",
        type: body?.data?.conversation?.type ?? "",
        pancakeUserId: body?.data?.conversation?.assignee_ids?.[0] ?? ""
      });

      if (newLead) {
        frappeNameId = newLead.name;
      }
    }

    if (frappeNameId) {
      await this.upsertFrappeLeadConversation(conversationId, frappeNameId);
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

  async backfillLeadSummaries(env, leads = null, delayMs = 500) {
    const aihub = new AIHUBClient(env);
    const results = [];
    const KV_KEY = "backfill_lead_summary_checkpoint";

    if (!leads) {
      const lastCheckpointStr = await env.FN_KV.get(KV_KEY);

      if (lastCheckpointStr) {
        console.warn(`[Backfill] Resuming from checkpoint: ${lastCheckpointStr}`);
        const { time, lastId } = JSON.parse(lastCheckpointStr);
        leads = await this.db.$queryRaw`
          SELECT c.page_id AS "pageId", c.id AS "conversationId", c.inserted_at AS "insertedAt"
          FROM pancake.conversation c 
          JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id 
          WHERE c.inserted_at >= '2026-01-01 00:00:00'::timestamp AND c.inserted_at <= '2026-03-17 00:00:00'::timestamp 
            AND c.type = 'INBOX' 
            AND c.id NOT LIKE '%pzl_%' AND pc.phone IS NOT NULL AND pc.phone != ''
            AND (c.inserted_at < ${time}::timestamp OR (c.inserted_at = ${time}::timestamp AND c.id < ${lastId}))
          ORDER BY c.inserted_at DESC, c.id DESC
        `;
        console.warn(leads.length);
      } else {
        leads = await this.db.$queryRaw`
          SELECT c.page_id AS "pageId", c.id AS "conversationId", c.inserted_at AS "insertedAt"
          FROM pancake.conversation c 
          JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id 
          WHERE c.inserted_at >= '2026-01-01 00:00:00'::timestamp AND c.inserted_at <= '2026-03-17 00:00:00'::timestamp  
            AND c.type = 'INBOX' 
            AND c.id NOT LIKE '%pzl_%' AND pc.phone IS NOT NULL AND pc.phone != ''
          ORDER BY c.inserted_at DESC, c.id DESC
        `;
      }
    }

    if (!leads || leads.length === 0) {
      console.warn("[Backfill] No more leads to process.");
      return results;
    }

    let processedCount = 0;
    const BATCH_SIZE = 50;
    let lastCheckpointData = null;

    for (const lead of leads) {
      const { pageId, conversationId, insertedAt } = lead;

      try {
        const existingDocName = await this.findExistingLead({
          conversationId: conversationId
        });

        if (!existingDocName) {
          console.warn(`[Backfill] Skipped ${conversationId}: No existing lead found.`);
          results.push({ conversationId, status: "skipped", reason: "Lead not found" });
        } else {
          const response = await aihub.makeRequest("/lead-info", {
            "pageId": pageId,
            "conversationId": conversationId,
            "webhookUrl": `${env.HOST}/webhook/ai-hub/erp/leads`
          });

          console.warn(`[Backfill] Successfully triggered summary for ${conversationId}`);
          results.push({ conversationId, status: "success", data: response });
        }
      } catch (error) {
        console.warn(`[Backfill] Error processing ${conversationId}:`, error.message);
        results.push({ conversationId, status: "error", error: error.message });
      }

      if (insertedAt) {
        lastCheckpointData = JSON.stringify({
          time: new Date(insertedAt).toISOString(),
          lastId: conversationId
        });
      }

      processedCount++;

      // Checkpoint tracking by batch
      if (processedCount % BATCH_SIZE === 0 && lastCheckpointData && env.FN_KV) {
        console.warn(`[Backfill] Saving checkpoint (Batch ${processedCount}): ${lastCheckpointData}`);
        await env.FN_KV.put(KV_KEY, lastCheckpointData);
      }

      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Save final checkpoint if there was a remainder
    if (processedCount % BATCH_SIZE !== 0 && lastCheckpointData && env.FN_KV) {
      console.warn(`[Backfill] Saving final checkpoint: ${lastCheckpointData}`);
      await env.FN_KV.put(KV_KEY, lastCheckpointData);
    }

    return results;
  }

  async triggerExtraHooks(body) {
    const promises = EXTRA_HOOKS.map(url =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
    );

    await Promise.all(promises);
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

  static async dequeueMessageSyncCustomerToLeadCRM(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.syncCustomerToLeadCrm(message.body);
    }
  }

  static async dequeueExtraHooksQueue(batch, env) {
    const conversationService = new ConversationService(env);
    for (const message of batch.messages) {
      await conversationService.triggerExtraHooks(message.body);
    }
  }
}
