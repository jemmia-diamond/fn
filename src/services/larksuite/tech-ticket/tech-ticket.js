import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import LarksuiteService from "services/larksuite/lark";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class TechTicketService {
  /**
   * Helper to extract text from LarkSuite field (array of text objects)
   * @param {Array|String} field - Field value from LarkSuite
   * @returns {String|null} - Extracted text or null
   */
  static extractText(field) {
    if (!field) return null;
    if (typeof field === "string") return field;
    if (Array.isArray(field) && field.length > 0 && field[0].text) {
      return field[0].text;
    }
    return null;
  }

  /**
   * Helper to extract integer from LarkSuite field
   * @param {Number|Object} field - Field value from LarkSuite
   * @returns {Number|null} - Extracted integer or null
   */
  static extractInt(field) {
    if (!field) return null;
    if (typeof field === "number") return field;
    if (typeof field === "object" && field.value !== undefined) {
      return parseInt(field.value, 10) || null;
    }
    return null;
  }

  /**
   * Helper function to map LarkSuite fields to tech ticket database fields
   * @param {Object} fields - LarkSuite fields object
   * @returns {Object} - Mapped fields for database
   */
  static mapFieldsToTicket(fields) {
    // Helper to convert LarkSuite timestamp to Date or null
    const toDate = (timestamp) => {
      if (!timestamp) return null;
      return new Date(timestamp);
    };

    return {
      ticket_id: this.extractText(fields["Ticket ID"]),
      ticket_name: this.extractText(fields["Tên Vấn Đề"]),
      ticket_type: this.extractText(fields["Loại Yêu Cầu"]),
      ticket_priority: this.extractText(fields["Mức Độ Khẩn Cấp"]),
      ticket_status: this.extractText(fields["Tình Trạng Xử Lý"]),
      description: this.extractText(fields["Mô Tả Vấn Đề"]),
      solution_update: this.extractText(fields["Kết Quả/Cập Nhật Xử Lý"]),
      created_time: toDate(fields["Ngày tạo"]),
      updated_time: toDate(fields["Ngày Cập Nhật"]),
      manual_updated_time: toDate(fields["Ngày Cập Nhật (Manual)"]),
      completed_time: toDate(fields["Ngày Hoàn Thành"]),
      expected_completion_time: toDate(fields["Ngày Hoàn Thành Mong Đợi"]),
      ticket_no_in_month: this.extractText(fields["Ticket No. In Month"]),
      current_number_in_month: this.extractInt(fields["Current Number In Month"])
    };
  }

  /**
   * Fetches a single page of tech tickets from LarkSuite
   * @param {Object} env - Environment configuration
   * @param {Object} filter - LarkSuite filter object
   * @param {string} pageToken - Page token for pagination (optional)
   * @param {number} pageSize - Number of records per page (default: 200)
   * @returns {Promise<Object>} - Object with { items: [], hasMore: boolean, pageToken: string }
   */
  static async fetchTechTicketsPage(env, filter, pageToken = null, pageSize = 100) {
    const larkClient = await LarksuiteService.createClientV2(env);

    const payload = {
      path: {
        app_token: TABLES.TECH_TICKET.app_token,
        table_id: TABLES.TECH_TICKET.table_id
      },
      params: {
        user_id_type: "open_id",
        page_size: pageSize
      },
      data: { filter }
    };

    // Add page token if provided
    if (pageToken) {
      payload.params.page_token = pageToken;
    }

    const response = await larkClient.bitable.appTableRecord.search(payload);

    // Check for errors
    if (response?.code && response.code !== 0) {
      throw new Error(
        `LarkSuite API error: ${response.msg || "Unknown error"} (code: ${response.code}). ` +
        `Details: ${JSON.stringify(response.error || {})}`
      );
    }

    return {
      items: response?.data?.items || [],
      hasMore: response?.data?.has_more || false,
      pageToken: response?.data?.page_token || null
    };
  }

  /**
   * Saves tech ticket records to the database using Prisma ORM
   * @param {Object} env - Environment configuration
   * @param {Array} records - Array of tech ticket records to save
   * @returns {Promise<Object>} - Statistics about the save operation
   */
  static async saveTechTicketsToDatabase(env, records) {
    const db = Database.instance(env);

    let created = 0;
    let updated = 0;
    let failed = 0;

    // Process in chunks to avoid overwhelming the database but effectively use concurrency
    const CHUNK_SIZE = 50;

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);

      const results = await Promise.all(chunk.map(async (record) => {
        try {
          const fields = record.fields || {};
          const mappedFields = this.mapFieldsToTicket(fields);

          const result = await db.larksuiteTechTickets.upsert({
            where: {
              record_id: record.record_id
            },
            update: {
              ...mappedFields,
              synced_at: new Date()
            },
            create: {
              record_id: record.record_id,
              ...mappedFields
            }
          });

          return result ? "created" : "failed";
        } catch (error) {
          console.warn(`Failed to save record ${record.record_id}:`, error);
          return "failed";
        }
      }));

      // Count results
      results.forEach(res => {
        if (res === "created") created++;
        else failed++;
      });

      console.warn(`... saved ${Math.min(i + CHUNK_SIZE, records.length)}/${records.length} records in current batch`);
    }

    return {
      total: records.length,
      created,
      updated,
      failed
    };
  }

  /**
   * Main cronjob method: Fetches tech tickets for 2025 and saves them to the database in batches
   * @param {Object} env - Environment configuration
   * @returns {Promise<Object>} - Statistics about the sync operation
   */
  static async syncTechTickets(env, options = { mode: "full" }) {
    try {
      // Build 2025 year filter in Vietnam time (UTC+7)
      let startSyncTime, endSyncTime;

      if (options.mode === "weekly") {
        const lastSyncTime = await env.FN_KV.get("TECH_TICKET_LAST_WEEKLY_SYNC");
        const now = dayjs().utc();
        endSyncTime = now.valueOf();

        if (lastSyncTime) {
          startSyncTime = dayjs.utc(lastSyncTime).valueOf();
          console.warn(`Starting weekly tech ticket sync (Incremental): ${lastSyncTime} to ${now.format()}`);
        } else {
          startSyncTime = now.subtract(7, "day").valueOf();
          console.warn(`Starting weekly tech ticket sync (Last 7 days): ${now.subtract(7, "day").format()} to ${now.format()}`);
        }
      } else {
        startSyncTime = dayjs.utc("2024-12-31T17:00:00").valueOf();
        endSyncTime = dayjs.utc("2025-12-31T16:59:59").valueOf();
        console.warn("Starting full 2025 tech ticket sync...");
      }

      const filter = {
        conjunction: "and",
        conditions: [
          {
            field_name: "Ngày tạo",
            operator: "isGreater",
            value: ["ExactDate", startSyncTime]
          },
          {
            field_name: "Ngày tạo",
            operator: "isLess",
            value: ["ExactDate", endSyncTime]
          }
        ]
      };

      let pageToken = null;
      let batchNumber = 0;
      let totalFetched = 0;
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalFailed = 0;
      const pageSize = 100;

      // Fetch and save in batches
      do {
        batchNumber++;
        console.warn(`\nFetching batch ${batchNumber} (${pageSize} records)...`);

        // Fetch one page
        const { items, hasMore, pageToken: nextPageToken } = await this.fetchTechTicketsPage(
          env,
          filter,
          pageToken,
          pageSize
        );

        if (items.length === 0) break;

        totalFetched += items.length;
        console.warn(`✓ Fetched ${items.length} records`);

        // Save this batch immediately
        console.warn(`Saving batch ${batchNumber}...`);
        const stats = await this.saveTechTicketsToDatabase(env, items);
        totalCreated += stats.created;
        totalUpdated += stats.updated;
        totalFailed += stats.failed;

        console.warn(`✓ Batch ${batchNumber} complete: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`);

        // Move to next page
        pageToken = nextPageToken;

        // If no more pages, break
        if (!hasMore) {
          break;
        }
      } while (pageToken);

      console.warn("Tech ticket sync completed!");

      // If weekly mode (Friday), save the checkpoint timestamp to KV
      if (options.mode === "weekly") {
        try {
          const checkpointTime = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
          await env.FN_KV.put("TECH_TICKET_LAST_WEEKLY_SYNC", checkpointTime);
          console.warn(`Saved weekly sync checkpoint to KV (UTC): ${checkpointTime}`);
        } catch (kvError) {
          console.warn("Failed to save weekly sync checkpoint to KV:", kvError);
        }
      }

      return {
        success: true,
        recordsFetched: totalFetched,
        created: totalCreated,
        updated: totalUpdated,
        failed: totalFailed
      };
    } catch (error) {
      console.warn("Error syncing tech tickets:", error);
      throw error;
    }
  }
}
