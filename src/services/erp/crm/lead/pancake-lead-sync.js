import LeadService from "services/erp/crm/lead/lead";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { Prisma } from "@prisma-cli";

dayjs.extend(utc);

export default class PancakeLeadSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.leadService = new LeadService(env);
    this.DEFAULT_TIME_MARK = "2020-05-31 17:00:00";
    this.BATCH_SIZE = 50;
    this.KV_KEY = "pancake_lead_sync_last_time";
  }

  async syncPancakeLeads() {
    console.warn("Starting syncPancakeLeads...");

    // Get latest checkpoint
    let lastSyncTime = await this.env.FN_KV.get(this.KV_KEY);
    if (!lastSyncTime) {
      lastSyncTime = dayjs().utc().subtract(5, "minutes").subtract(1, "minute").format("YYYY-MM-DD HH:mm:ss");
    }

    const updatedTime = lastSyncTime;
    const defaultTimeMark = this.DEFAULT_TIME_MARK;

    console.warn(`Syncing leads updated since ${updatedTime}`);

    let offset = 0;
    let totalProcessed = 0;

    while (true) {
      const leadsData = await this.getLeadData(offset, this.BATCH_SIZE, updatedTime, defaultTimeMark);

      if (!leadsData || leadsData.length === 0) {
        break;
      }

      const insertLeads = [];
      const updateLeads = [];

      for (const lead of leadsData) {
        if (!lead.frappe_name_id) {
          insertLeads.push(lead);
        } else {
          updateLeads.push(lead);
        }
      }

      const batchCount = leadsData.length;
      console.warn(`Total: ${batchCount}, Insert leads: ${insertLeads.length}, Update leads: ${updateLeads.length}`);

      offset += this.BATCH_SIZE;
      totalProcessed += batchCount;

      // Process Inserts
      if (insertLeads.length > 0) {
        try {
          const insertResponse = await this.leadService.insertLeads(insertLeads);

          if (insertResponse && Array.isArray(insertResponse)) {
            const toInsertLeads = [];
            insertResponse.forEach((result) => {
              const conversationId = result?.conversation_id;
              const frappeNameId = result?.name;

              if (conversationId && frappeNameId) {
                toInsertLeads.push({
                  conversation_id: conversationId,
                  frappe_name_id: frappeNameId
                });
              }
            });
            if (toInsertLeads.length > 0) {
              await this.saveSyncedLeadsBatch(toInsertLeads);
            }
          } else {
            console.warn("Invalid response from insert_many_leads", insertResponse);
          }
        } catch (error) {
          console.warn("Error inserting leads batch:", error);
          Sentry.captureException(error);
        }
      }

      // Process Updates
      if (updateLeads.length > 0) {
        try {
          const updateResponse = await this.leadService.updateLeads(updateLeads);

          if (updateResponse && Array.isArray(updateResponse)) {
            const toUpsertLeads = [];
            updateResponse.forEach(result => {
              if (result.name && result.conversation_id) {
                toUpsertLeads.push({
                  conversation_id: result.conversation_id,
                  frappe_name_id: result.name
                });
              }
            });

            if (toUpsertLeads.length > 0) {
              await this.saveSyncedLeadsBatch(toUpsertLeads);
            }
          }
        } catch (error) {
          console.warn("Error updating leads batch:", error);
          Sentry.captureException(error);
        }
      }
    }

    // Save new checkpoint
    const currentTime = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    await this.env.FN_KV.put(this.KV_KEY, currentTime);

    console.warn(`Finished sync. Total processed: ${totalProcessed}. Checkpoint saved: ${currentTime}`);
  }

  async getLeadData(offset, batchSize, updatedTime, defaultTimeMark) {
    const query = Prisma.sql`
      WITH base_conversations AS (
        SELECT c.id, c.page_id, c.customer_id, c.type, c.inserted_at, c.updated_at,
          c.has_phone, c.last_sent_at, 
          pc.name as customer_name, 
          pc.phone as customer_phone, 
          pc.gender as customer_gender, 
          pc.birthday as customer_birthday, 
          pc.phone_numbers as customer_phone_numbers, 
          pc.lives_in as customer_lives_in, 
          pc.can_inbox as can_inbox,
          c.added_user_id,
          c.avatar_url,
          c.ad_ids 
        FROM pancake.conversation c 
        LEFT JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id 
        WHERE c.type = 'INBOX' 
          AND (c.updated_at >= ${updatedTime}::timestamp OR pc.updated_at >= ${updatedTime}::timestamp)  
          AND (
              c.inserted_at >= ${defaultTimeMark}::timestamp OR 
              c.last_sent_at IS NULL OR 
              (c.last_sent_at IS NOT NULL AND c.last_sent_at >= ${defaultTimeMark}::timestamp)
          )
        ORDER BY c.updated_at DESC
        LIMIT ${batchSize} OFFSET ${offset}
      ),
      conversation_tags AS (
        SELECT 
          ct.*,
          ROW_NUMBER() OVER (PARTITION BY conversation_id, tag_page_id ORDER BY database_updated_at DESC) AS rn
        FROM pancake.conversation_tag ct
        WHERE ct.conversation_id IN (SELECT id FROM base_conversations)
      ),
      valid_tags AS (
        SELECT *
        FROM conversation_tags
        WHERE rn = 1 AND action = 'add'
      )
      SELECT 
        c.id as conversation_id,
        c.page_id,
        c.customer_id,
        c.type,
        c.inserted_at, 
        c.updated_at,
        c.has_phone,
        p.name as page_name,
        p.platform as platform,
        customer_name,
        customer_phone,
        customer_gender,
        customer_birthday,
        customer_phone_numbers,
        customer_lives_in,
        can_inbox,
        flc.frappe_name_id as frappe_name_id, 
        array_remove(array_agg(vt.tag_label), NULL) as tags,
        c.last_sent_at as latest_message_at, 
        c.added_user_id as pancake_user_id,
        c.avatar_url as pancake_avatar_url,
        c.ad_ids
      FROM base_conversations c
      LEFT JOIN pancake.conversation_page_customer cpc ON c.id = cpc.conversation_id
      LEFT JOIN pancake.page p ON p.id = c.page_id 
      LEFT JOIN pancake.frappe_lead_conversation flc ON c.id = flc.conversation_id 
      LEFT JOIN valid_tags vt ON c.id = vt.conversation_id 
      GROUP BY 
        c.id, c.page_id, c.customer_id, c.type, c.inserted_at, c.updated_at, c.has_phone, 
        customer_name, 
        customer_phone, 
        customer_gender, 
        customer_birthday,  
        customer_phone_numbers, 
        customer_lives_in, 
        can_inbox,
        flc.frappe_name_id, p.platform, c.last_sent_at, p.name, c.added_user_id, c.avatar_url, c.ad_ids 
      ORDER BY c.updated_at DESC
    `;

    try {
      const result = await this.db.$queryRaw(query);
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          service: "pancake-lead-sync",
          flow: "getLeadData"
        }
      });
      return [];
    }
  }

  async saveSyncedLeadsBatch(leads) {
    if (!leads || leads.length === 0) return;
    const queries = leads.map(lead => {
      return this.db.frappe_lead_conversation.upsert({
        where: { conversation_id: lead.conversation_id },
        update: {
          frappe_name_id: lead.frappe_name_id,
          updated_at: new Date()
        },
        create: {
          conversation_id: lead.conversation_id,
          frappe_name_id: lead.frappe_name_id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    });

    try {
      await Promise.all(queries);
    } catch (error) {
      console.warn("Error saving synced leads:", error);
      throw error;
    }
  }
}
