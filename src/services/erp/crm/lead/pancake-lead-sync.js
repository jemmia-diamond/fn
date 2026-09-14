import { Prisma } from "@prisma-cli";
import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import LeadService from "services/erp/crm/lead/lead";

dayjs.extend(utc);

export default class PancakeLeadSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.leadService = new LeadService(env);
    this.DEFAULT_TIME_MARK = "2020-05-31 17:00:00";
    this.BATCH_SIZE = 50;
  }

  async getSyncTimeframe(batchTime) {
    const kv = this.env.FN_KV;
    const KV_KEY = "pancake_lead_sync_last_time";
    const now = batchTime ? batchTime : dayjs().utc();

    const lastSyncTimeStr = await kv.get(KV_KEY);
    let updatedTime;

    if (lastSyncTimeStr) {
      updatedTime = lastSyncTimeStr;
    } else {
      updatedTime = now
        .subtract(5, "minutes")
        .subtract(1, "minute")
        .format("YYYY-MM-DD HH:mm:ss");
    }

    return { now, updatedTime, KV_KEY };
  }

  async syncPancakeLeads({ batchTime } = {}) {
    console.warn("Starting syncPancakeLeads...");

    const { now, updatedTime, KV_KEY } = await this.getSyncTimeframe(batchTime);
    const defaultTimeMark = this.DEFAULT_TIME_MARK;

    console.warn(`Syncing leads updated since ${updatedTime}`);

    let offset = 0;
    let totalProcessed = 0;
    let hasError = false;

    while (true) {
      const leadsData = await this.getLeadData(
        offset,
        this.BATCH_SIZE,
        updatedTime,
        defaultTimeMark
      );

      if (!leadsData || leadsData.length === 0) {
        break;
      }

      const batchCount = leadsData.length;
      console.warn(`Total: ${batchCount}`);

      offset += this.BATCH_SIZE;
      totalProcessed += batchCount;

      try {
        const updateResponse = await this.leadService.updateLeads(leadsData);

        if (updateResponse && Array.isArray(updateResponse)) {
          updateResponse.forEach((result) => {
            if (result && result.name === null) {
              console.warn(
                `Lead sync failed for conversation ${result.conversation_id}`
              );
              hasError = true;
            }
          });
        }
      } catch (error) {
        console.warn("Error syncing leads batch:", error);
        Sentry.captureException(error);
        hasError = true;
      }
    }

    // Save checkpoint — always advance with 1-minute overlap buffer to prevent data loss
    const currentTime = now.subtract(1, "minute").format("YYYY-MM-DD HH:mm:ss");
    await this.env.FN_KV.put(KV_KEY, currentTime);

    if (hasError) {
      console.warn(
        `Finished sync with errors. Total processed: ${totalProcessed}. Checkpoint advanced to ${currentTime} (with overlap).`
      );
    } else {
      console.warn(
        `Finished sync. Total processed: ${totalProcessed}. Checkpoint saved: ${currentTime}`
      );
    }
  }

  async getLeadData(offset, batchSize, updatedTime, defaultTimeMark) {
    const query = Prisma.sql`
      WITH base_conversations AS (
        SELECT c.id, c.page_id, c.customer_id, c.type, c.inserted_at, c.updated_at,
          c.has_phone, c.last_sent_at, c.last_sales_message_at, c.last_customer_message_at,
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
        array_remove(array_agg(vt.tag_label), NULL) as tags,
        c.last_sent_at as latest_message_at, 
        c.last_sales_message_at,
        c.last_customer_message_at,
        c.added_user_id as pancake_user_id,
        c.avatar_url as pancake_avatar_url,
        c.ad_ids
      FROM base_conversations c
      LEFT JOIN pancake.conversation_page_customer cpc ON c.id = cpc.conversation_id
      LEFT JOIN pancake.page p ON p.id = c.page_id
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
        p.platform, c.last_sent_at, c.last_sales_message_at, c.last_customer_message_at, p.name, c.added_user_id, c.avatar_url, c.ad_ids
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
}
