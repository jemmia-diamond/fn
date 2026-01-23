import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class PancakeConversationSyncService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  async syncMissingInsertedAt() {
    let totalSynced = 0;
    let offset = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const contacts = await this.frappeClient.getList("Contact", {
          fields: ["name", "pancake_conversation_id"],
          filters: [
            ["pancake_conversation_id", "is", "set"],
            ["pancake_inserted_at", "is", "set"],
            ["inserted_at", "is", "not set"]
          ],
          limit_page_length: 100,
          limit_start: offset,
          order_by: "creation desc"
        });

        if (!contacts || contacts.length === 0) {
          hasMore = false;
          break;
        }

        const conversationIds = contacts
          .map(c => c.pancake_conversation_id)
          .filter(id => id);

        if (conversationIds.length === 0) {
          offset += contacts.length;
          continue;
        }

        const conversations = await this.db.conversation.findMany({
          where: {
            id: { in: conversationIds }
          },
          select: {
            id: true,
            inserted_at: true,
            updated_at: true,
            customer_id: true
          }
        });

        const conversationMap = new Map();
        if (conversations && conversations.length > 0) {
          conversations.forEach(c => {
            conversationMap.set(c.id, c);
          });
        }

        const updates = [];
        for (const contact of contacts) {
          const conversation = conversationMap.get(contact.pancake_conversation_id);
          if (conversation) {
            const updateData = {
              doctype: "Contact",
              name: contact.name
            };

            if (conversation.inserted_at) {
              updateData.pancake_inserted_at = dayjs(conversation.inserted_at).utc().format("YYYY-MM-DD HH:mm:ss.SSSSSS");
              updateData.inserted_at = dayjs(conversation.inserted_at).utc().format("YYYY-MM-DD HH:mm:ss.SSSSSS");
            }

            if (conversation.updated_at) {
              updateData.pancake_updated_at = dayjs(conversation.updated_at).utc().format("YYYY-MM-DD HH:mm:ss.SSSSSS");
            }

            if (conversation.customer_id) {
              updateData.pancake_customer_id = conversation.customer_id;
            }

            if (Object.keys(updateData).length > 1) {
              updates.push(updateData);
            }
          }
        }

        if (updates.length > 0) {
          await this.frappeClient.bulkUpdate(updates);
          totalSynced += updates.length;
        }

        const successCount = updates.length;
        const failCount = contacts.length - successCount;
        offset += failCount;

        // Avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return totalSynced;

    } catch (error) {
      Sentry.captureException(error);
      console.warn("Error in PancakeConversationSyncService:", error);
    }
  }
}
