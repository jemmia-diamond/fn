import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError } from "pancake/utils";

dayjs.extend(utc);

export default class ConversationSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
  }

  async syncConversations() {
    console.warn("Starting syncConversations...");

    const now = dayjs().utc();
    const untilUnix = now.unix();
    const sinceUnix = now.subtract(10, "minutes").unix();

    let pageData;
    try {
      pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        Sentry.captureException(new Error("Pancake API Error [102]: Invalid access_token during page query"));
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch pancake pages", e);
      return;
    }

    const pageList = pageData?.categorized?.activated || [];
    if (pageList.length === 0) {
      console.warn("No activated pages found.");
      return;
    }

    for (let i = pageList.length - 1; i >= 0; i--) {
      const page = pageList[i];
      const pageId = page.id;
      let pageNumber = 1;

      while (true) {
        try {
          const data = await this.pancakeClient.getConversations(
            pageId,
            sinceUnix,
            untilUnix,
            pageNumber
          );

          if (isInvalidTokenError(data)) {
            Sentry.captureException(new Error(`Pancake API Error [102]: Invalid access_token for page ${pageId}`));
            break;
          }

          if (!data || !data.conversations || data.conversations.length === 0) {
            break;
          }

          await this.upsertConversations(data.conversations, pageId);
          pageNumber++;
        } catch (error) {
          console.warn(`Error syncing conversation for page ${pageId}: ${error.message}`);
          Sentry.captureException(error);
          break;
        }
      }
    }

    console.warn("Finished syncConversations.");
  }

  async upsertConversations(conversations, _pageId) {
    const excPageIds = ["zl_2838947343790196672", "110263770893806", "114459901519364", "ttm_-000GnI37aFDBuqWw6N750AvvJXaodrxaoS6", "104886481441594"];

    const chunkSize = 50;
    for (let i = 0; i < conversations.length; i += chunkSize) {
      const chunk = conversations.slice(i, i + chunkSize);

      const conversationUpserts = [];
      const pageCustomerUpserts = [];
      const conversationTagUpserts = [];

      const duplicatesTagKey = new Set();

      for (const item of chunk) {
        let addedUsers = null;
        const assigneeHistories = item.assignee_histories || [];
        if (assigneeHistories.length > 0) {
          const payload = assigneeHistories[assigneeHistories.length - 1].payload || {};
          const payloadAddedUsers = payload.added_users || [];
          if (payloadAddedUsers.length > 0) {
            addedUsers = payloadAddedUsers[0];
          }
        }

        let lastSentAt = null;
        if (item.page_id && !excPageIds.includes(item.page_id)) {
          lastSentAt = item.updated_at ? new Date(item.updated_at) : null;
        }

        const customers = item.customers || [];
        const avatarUrl = customers.length > 0 ? customers[0].avatar_url : null;

        const conversationData = {
          uuid: crypto.randomUUID(),
          id: item.id || null,
          customer_id: item.customer_id || null,
          type: item.type || null,
          inserted_at: item.inserted_at ? new Date(item.inserted_at) : null,
          page_id: item.page_id || null,
          has_phone: item.has_phone ?? null,
          post_id: item.post_id || null,
          assignee_histories: item.assignee_histories || null,
          added_users: addedUsers || null,
          added_user_id: addedUsers?.id || null,
          added_user_name: addedUsers?.name || null,
          added_user_email: addedUsers?.email || null,
          added_user_fb_id: addedUsers?.fb_id || null,
          ad_ids: item.ad_ids || null,
          updated_at: item.updated_at ? new Date(item.updated_at) : null,
          last_sent_at: lastSentAt,
          avatar_url: avatarUrl
        };

        if (item.id) {
          conversationUpserts.push(
            this.db.conversation.upsert({
              where: { id: item.id },
              create: conversationData,
              update: {
                ...conversationData,
                uuid: undefined,
                database_updated_at: new Date()
              }
            })
          );
        }

        for (const customerItem of customers) {
          if (item.id && customerItem.id) {
            const customerId = customerItem.id;
            const convId = item.id;

            pageCustomerUpserts.push(
              this.db.conversation_page_customer.upsert({
                where: {
                  customer_id_conversation_id: {
                    customer_id: customerId,
                    conversation_id: convId
                  }
                },
                create: {
                  uuid: crypto.randomUUID(),
                  customer_id: customerId,
                  conversation_id: convId
                },
                update: {
                  database_updated_at: new Date()
                }
              })
            );
          }
        }

        const tagHistories = item.tag_histories || [];
        for (const th of tagHistories) {
          const payload = th.payload || {};
          const tag = payload.tag || {};
          const tagPageId = tag.id;
          const insertedAt = th.inserted_at;
          const action = payload.action;

          if (tagPageId != null) {
            const tk = `${item.id}-${tagPageId}-${insertedAt}-${action}`;
            if (!duplicatesTagKey.has(tk)) {
              duplicatesTagKey.add(tk);

              const tagData = {
                uuid: crypto.randomUUID(),
                conversation_id: item.id,
                page_id: item.page_id,
                customer_id: item.customer_id,
                inserted_at: new Date(insertedAt),
                post_id: item.post_id,
                has_phone: item.has_phone,
                tag_page_id: tagPageId,
                tag_label: tag.text,
                tag_description: tag.description,
                action: action
              };

              conversationTagUpserts.push(
                this.db.conversation_tag.upsert({
                  where: {
                    conversation_id_inserted_at_tag_page_id_action: {
                      conversation_id: item.id,
                      inserted_at: new Date(insertedAt),
                      tag_page_id: tagPageId,
                      action: action
                    }
                  },
                  create: tagData,
                  update: {
                    ...tagData,
                    uuid: undefined,
                    database_updated_at: new Date()
                  }
                })
              );
            }
          }
        }
      }

      await Promise.all([
        ...conversationUpserts,
        ...pageCustomerUpserts,
        ...conversationTagUpserts
      ]);
    }
  }
}
