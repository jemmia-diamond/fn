import Database from "services/database";
import PancakeClient from "pancake/pancake-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { isInvalidTokenError, sleep } from "pancake/utils";

dayjs.extend(utc);

const EXCLUDED_PAGE_IDS = [
  "zl_2838947343790196672",
  "110263770893806",
  "114459901519364",
  "ttm_-000GnI37aFDBuqWw6N750AvvJXaodrxaoS6",
  "104886481441594"
];

export default class ConversationSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
  }

  async syncConversations() {
    try {
      console.warn("Starting syncConversations...");
      const { sinceUnix, untilUnix } = this.getSyncTimeframe();

      const pageData = await this.pancakeClient.getPages();
      if (isInvalidTokenError(pageData)) {
        throw new Error("Pancake API Error [102]: Invalid access_token during page query");
      }

      const pages = pageData?.categorized?.activated || [];
      if (pages.length === 0) {
        console.warn("No activated pages found.");
        return;
      }

      for (let i = pages.length - 1; i >= 0; i--) {
        await this.syncPageConversations(pages[i].id, sinceUnix, untilUnix);
        await sleep(1000);
      }

      console.warn("Finished syncConversations.");
    } catch (error) {
      this.captureException(error);
    }
  }

  async syncPageConversations(pageId, sinceUnix, untilUnix) {
    if (!pageId) return;

    let pageNumber = 1;
    while (true) {
      try {
        const data = await this.pancakeClient.getConversations(pageId, sinceUnix, untilUnix, pageNumber);

        if (isInvalidTokenError(data)) {
          this.captureException(new Error(`Pancake API Error [102]: Invalid access_token for page ${pageId}`), pageId);
          break;
        }

        const conversations = data?.conversations || [];
        if (conversations.length === 0) break;

        await this.upsertConversations(conversations, pageId);
        pageNumber++;
        await sleep(1000);
      } catch (error) {
        this.captureException(error, pageId);
        break;
      }
    }
  }

  async upsertConversations(conversations, _pageId) {
    const chunkSize = 50;
    for (let i = 0; i < conversations.length; i += chunkSize) {
      const chunk = conversations.slice(i, i + chunkSize);
      await this.processConversationChunk(chunk);
    }
  }

  async processConversationChunk(chunk) {
    const conversationUpserts = [];
    const pageCustomerUpserts = [];
    const conversationTagUpserts = [];
    const duplicatesTagKey = new Set();

    for (const item of chunk) {
      const conversationData = this.mapToConversationModel(item);
      if (item.id) {
        conversationUpserts.push(this.db.conversation.upsert({
          where: { id: item.id },
          create: conversationData,
          update: { ...conversationData, uuid: undefined, database_updated_at: dayjs().utc().toDate() }
        }));
      }

      this.mapAndPrepareCustomerUpserts(item, pageCustomerUpserts);
      this.mapAndPrepareTagUpserts(item, conversationTagUpserts, duplicatesTagKey);
    }

    await Promise.all([
      ...conversationUpserts,
      ...pageCustomerUpserts,
      ...conversationTagUpserts
    ]);
  }

  mapToConversationModel(item) {
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
    if (item.page_id && !EXCLUDED_PAGE_IDS.includes(item.page_id)) {
      lastSentAt = item.updated_at ? dayjs.utc(item.updated_at).toDate() : null;
    }

    const customers = item.customers || [];
    const avatarUrl = customers.length > 0 ? customers[0].avatar_url : null;

    return {
      uuid: crypto.randomUUID(),
      id: item.id || null,
      customer_id: item.customer_id || null,
      type: item.type || null,
      inserted_at: item.inserted_at ? dayjs.utc(item.inserted_at).toDate() : null,
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
      updated_at: item.updated_at ? dayjs.utc(item.updated_at).toDate() : null,
      last_sent_at: lastSentAt,
      avatar_url: avatarUrl
    };
  }

  mapAndPrepareCustomerUpserts(item, pageCustomerUpserts) {
    const customers = item.customers || [];
    for (const customerItem of customers) {
      if (item.id && customerItem.id) {
        pageCustomerUpserts.push(this.db.conversation_page_customer.upsert({
          where: { customer_id_conversation_id: { customer_id: customerItem.id, conversation_id: item.id } },
          create: { uuid: crypto.randomUUID(), customer_id: customerItem.id, conversation_id: item.id },
          update: { database_updated_at: dayjs().utc().toDate() }
        }));
      }
    }
  }

  mapAndPrepareTagUpserts(item, conversationTagUpserts, duplicatesTagKey) {
    const tagHistories = item.tag_histories || [];
    for (const th of tagHistories) {
      const payload = th.payload || {};
      const tag = payload.tag || {};
      const tagPageId = tag.id ? Number(tag.id) : null;
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
            inserted_at: dayjs.utc(insertedAt).toDate(),
            post_id: item.post_id,
            has_phone: item.has_phone,
            tag_page_id: tagPageId,
            tag_label: tag.text,
            tag_description: tag.description,
            action: action
          };

          conversationTagUpserts.push(this.db.conversation_tag.upsert({
            where: { conversation_id_inserted_at_tag_page_id_action: { conversation_id: item.id, inserted_at: dayjs.utc(insertedAt).toDate(), tag_page_id: tagPageId, action: action } },
            create: tagData,
            update: { ...tagData, uuid: undefined, database_updated_at: dayjs().utc().toDate() }
          }));
        }
      }
    }
  }

  getSyncTimeframe() {
    const now = dayjs().utc();
    return {
      now,
      untilUnix: now.unix(),
      sinceUnix: now.subtract(10, "minutes").unix()
    };
  }

  captureException(error, pageId = null) {
    const tags = { flow: "PancakeSync:conversations" };
    if (pageId) tags.page_id = pageId;
    Sentry.captureException(error, { tags });
  }
}
