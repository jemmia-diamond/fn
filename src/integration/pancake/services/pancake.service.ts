import { DatabaseClient } from 'core/clients/database.client';
import { PancakeConversationAddedUser, PancakeConversationItem } from '../types/pancake-conversation.type';
import { v4 as uuidv4 } from 'uuid';
import { conversation_tagInputType } from 'prisma/schema/generated/zod/schemas';
import { Prisma } from 'prisma/schema/generated/client';
import { PancakeApi } from '../api/pancake.api';
import * as Sentry from "@sentry/node";
import { PancakeBindings } from '../bindings/pancake.binding';

export class PancakeService {
  public static async isEmpty() {
    return (await DatabaseClient.client.conversation.count()) === 0;
  }

  public static async mappingConversation(item: PancakeConversationItem) {
    let addedUser: PancakeConversationAddedUser | undefined;

    if (item.assignee_histories.length > 0) {
      const payload = item.assignee_histories[-1].payload;
      const payloadAddedUsers = payload.added_users;

      if (payloadAddedUsers.length > 0) {
        addedUser = payloadAddedUsers[0];
      }
    }

    const conversation: Prisma.conversationCreateInput = {
      uuid: uuidv4(),
      page_id: item.page_id,
      id: item.id,
      customer_id: item.customer_id,
      type: item.type,
      inserted_at: item.inserted_at,
      updated_at: item.updated_at,
      has_phone: item.has_phone,
      post_id: item.post_id,
      assignee_histories: JSON.stringify(item.assignee_histories),
      added_users: JSON.stringify(addedUser),
      database_created_at: undefined,
      database_updated_at: undefined,
    };

    if (addedUser) {
      if (addedUser.fb_id) {
        conversation.added_user_fb_id = addedUser.fb_id;
      }
      
      if (addedUser.email) {
        conversation.added_user_email = addedUser.email;
      }

      if (addedUser.name) {
        conversation.added_user_name = addedUser.name;
      }

      if (addedUser.id) {
        conversation.added_user_id = addedUser.id;
      }
    }

    const excludedPageIds = [
      'zl_2838947343790196672',
      '110263770893806',
      '114459901519364',
      'ttm_-000GnI37aFDBuqWw6N750AvvJXaodrxaoS6',
      '104886481441594',
    ];

    if (item.page_id && !excludedPageIds.includes(item.page_id)) {
      conversation.last_sent_at = item.updated_at;
    }

    conversation.avatar_url = item.customers?.[0]?.avatar_url;

    return conversation;
  }

  public static mappingCoverCustomer(payload: Pick<PancakeConversationItem, 'customer_id' | 'conversation_id'>) {
    const conversationPageCustomer = {
      uuid: uuidv4(),
      customer_id: payload.customer_id,
      conversation_id: payload.conversation_id,
    };

    return conversationPageCustomer;
  }

  public static mappingCoverTag(
    payload: Pick<
      conversation_tagInputType,
      | 'page_id'
      | 'customer_id'
      | 'conversation_id'
      | 'inserted_at'
      | 'post_id'
      | 'has_phone'
      | 'tag_page_id'
      | 'tag_label'
      | 'tag_description'
      | 'action'
    >,
  ) {
    const conversationPageTag: conversation_tagInputType = {
      uuid: uuidv4(),
      ...payload,
    };

    return conversationPageTag;
  }

  public static async upsertConversation(data: PancakeConversationItem[]) {
    const conversations = [];
    const conversationCustomers = [];
    const conversationTags = [];

    for (const conversationItem of data) {
      conversations.push(await this.mappingConversation(conversationItem));
      for (const customerItem of conversationItem.customers ?? []) {
        conversationCustomers.push(
          this.mappingCoverCustomer({
            customer_id: customerItem.id,
            conversation_id: conversationItem.id,
          }),
        );
      }

      const duplicatesTagKey: string[] = [];

      for (const tagHistory of conversationItem.tag_histories) {
        if (tagHistory.payload.tag.id) {
          const conversationId = conversationItem.id;
          const tagPageId = tagHistory.payload.tag.id;
          const insertAt = tagHistory.payload.inserted_at;
          const action = tagHistory.payload.action;
          const tagKey = `${conversationId} ${tagPageId} ${insertAt} ${action}`;

          if (!duplicatesTagKey.includes(tagKey)) {
            duplicatesTagKey.push(tagKey);
            conversationTags.push(
              this.mappingCoverTag({
                conversation_id: conversationItem.id,
                page_id: conversationItem.page_id,
                customer_id: conversationItem.customer_id,
                post_id: conversationItem.post_id,
                has_phone: conversationItem.has_phone,
                inserted_at: insertAt,
                action,
                tag_page_id: tagHistory.payload.tag.id,
                tag_label: tagHistory.payload.tag.label,
                tag_description: tagHistory.payload.tag.description,
              }),
            );
          }
        }
      }
    }

    if (conversations.length > 0) {
      const filteredConversation = conversations
        .filter(c => c.last_sent_at !== null && c.last_sent_at !== undefined);

      if (filteredConversation.length > 0) {
        for (const conversation of filteredConversation) {
          await DatabaseClient.client.conversation.upsert({
            where: {
              id: conversation.id!,
            },
            update: conversation,
            create: conversation,
          });
        }
      }

      const filteredWebhookConversation = conversations
        .filter(c => c.last_sent_at === null || c.last_sent_at === undefined);

      if (filteredWebhookConversation.length > 0) {
        for (const conversation of filteredWebhookConversation) {
          await DatabaseClient.client.conversation.upsert({
            where: {
              id: conversation.id!,
            },
            update: conversation,
            create: conversation,
          });
        }
      }
    }

    if (conversationCustomers.length > 0) {
      for (const conversationCustomer of conversationCustomers) {
        await DatabaseClient.client.conversation_page_customer.upsert({
          where: {
            customer_id_conversation_id: {
              customer_id: conversationCustomer.customer_id,
              conversation_id: conversationCustomer.conversation_id,
            },
          },
          update: conversationCustomer,
          create: conversationCustomer,
        });
      }
    }

    if (conversationTags.length > 0) {
      for (const conversationTag of conversationTags) {
        await DatabaseClient.client.conversation_tag.upsert({
          where: {
            conversation_id_inserted_at_tag_page_id_action: {
              conversation_id: conversationTag.conversation_id,
              inserted_at: conversationTag.inserted_at,
              tag_page_id: conversationTag.tag_page_id,
              action: conversationTag.action,
            },
          },
          update: conversationTag,
          create: conversationTag,
        });
      }
    }
  }

  public static async scheduleHandler(env: PancakeBindings) {
    PancakeApi.initialize(env.PANCAKE_ACCESS_TOKEN!);
    try {
      const nowUtc = new Date();
      const nowFormattedDate = nowUtc.toISOString();
      const untilUnix = Math.floor(nowUtc.getTime() / 1000);
      const sinceHourEarlier = new Date(nowUtc.getTime() - 10 * 60 * 1000); // 10 minutes earlier
      const sinceUnix = Math.floor(sinceHourEarlier.getTime() / 1000);
      const pageData = await PancakeApi.getPages() as { categorized?: { activated?: Array<{ id: string }> } };
      const pageList = pageData?.categorized?.activated;
      
      if (!pageList || pageList.length === 0) {
        return { statusCode: 200, body: "Data processed successfully" };
      }
      
      // Reverse the page list to match Python logic
      const reversedPageList = [...pageList].reverse();
      
      for (const [_, page] of reversedPageList.entries()) {
        const currentPageId = page.id;
        let currentPageNumber = 1;
        while (true) {
          try {
            const data = await PancakeApi.getConversation(
              currentPageId,
              sinceUnix,
              untilUnix,
              currentPageNumber,
              'updated_at'
            ) as { conversations?: PancakeConversationItem[] };

            if (!data) {
              break;
            }

            const conversations = data.conversations;

            if (!conversations || conversations.length === 0) {
              break;
            }

            await this.upsertConversation(conversations);
            currentPageNumber += 1;
          } catch (error) {
            console.error(error);
            Sentry.captureException(error);
            currentPageNumber += 1;
            break;
          }
        }
      }

      return { statusCode: 200, body: "Data processed successfully" };
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      return {
        statusCode: 500,
        body: `Error processing request: ${error}`,
        errorDetails: String(error),
      };
    }
  }
}
