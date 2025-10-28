import axios, { AxiosInstance } from "axios";
import { Context } from "hono";

type pageId = string;
type pageAccessToken = string;

export class PancakeApi {
  private static _axios: AxiosInstance;
  private static baseUrl: string = "https://pages.fm/api";
  private static timeout: number = 30_000;
  private static pageAccessTokens: Map<pageId, pageAccessToken> = new Map();
  private static accessToken?: string;
  private static pageClients: Map<pageId, AxiosInstance> = new Map();

  public static initialize(accessToken: string) {
    this.createClient(accessToken);
  }

  public static createClient(accessToken?: string) {
    this.accessToken = accessToken;
    this._axios = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        access_token: this.accessToken,
      }
    });
  }

  private static async retrievePageAccessToken(pageId: string) {
    if (this.pageAccessTokens.has(pageId)) {
      return this.pageAccessTokens.get(pageId) as pageAccessToken;
    }

    const response = await this._axios.post(
        `/v1/pages/${pageId}/generate_page_access_token`,
      ) as { page_access_token: string };
    this.pageAccessTokens.set(pageId, response.page_access_token);

    return response.page_access_token;
  }

  public static async getPages() {
    const res = await this._axios.get(
      `/v1/pages`,
    );

    return res.data;
  }

  public static async generatePageQueryParams(pageId: string) {
    const pageToken = await this.retrievePageAccessToken(pageId);
    
    return { pageToken };
  }

  public static async getPageClient(pageId: string) {
    if (this.pageClients.has(pageId)) {
      return this.pageClients.get(pageId)!;
    }
    
    const pageClient = axios.create({
      baseURL: `${this.baseUrl}/public_api/v1/pages/${pageId}`,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        access_token: this.accessToken,
        ...(await this.generatePageQueryParams(pageId)),
      }
    });
    this.pageClients.set(pageId, pageClient);

    return pageClient;
  }

  // List Conversations
  public static async getConversation(
    pageId: string,
    sinceUnix: number,
    untilUnix: number,
    pageNumber: number,
    orderBy: string = "updated_at"
  ) {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `conversations`,
      {
        params: {
          since: sinceUnix,
          until: untilUnix,
          page_number: pageNumber,
          order_by: orderBy,
        }
      }
    );
  }

  // Add/Remove Conversation Tag
  public static async conversationTag(
    pageId: string,
    conversationId: string,
    action: string,
    tagId: string
  ) {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `conversations/${conversationId}/tags`,
      { action, tag_id: tagId },
    )
  }

  // Assign Conversation
  public static async assignConversation(
    pageId: string,
    conversationId: string,
    assigneeIds: string[]
  ) {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `conversations/${conversationId}/assign`,
      { assignee_ids: assigneeIds },
    )
  }

  // Mark Conversation as Read/Unread
  public static async markConversationAs(
    pageId: string,
    conversationId: string,
    action: string = "read"
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `conversations/${conversationId}/${action}`,
    )
  }

  // Get Messages
  public static async getMessages(
    pageId: string,
    conversationId: string,
    customerId: string,
    currentCount?: number
  ) {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `conversations/${conversationId}/messages`,
      {
        params: {
          customer_id: customerId,
          current_count: currentCount,
        }
      }
    );
  }

  // Get Ads Statistics
  public static async adsStatistics(pageId: string, since: number, until: number)  {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/pages_campaigns`,
      {
        params: {
          since,
          until,
        }
      }
    );
  }

  // Get Engagement Statistics
  public static async engagementStatistics(
    pageId: string,
    byHour: boolean = false,
    dateRange?: string,
    userIds?: string
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/customer_engagements`,
      {
        params: {
          by_hour: byHour,
          date_range: dateRange,
          user_ids: userIds,
        }
      }
    );
  }

  // Page statistics
  public static async getPageStatistic(pageId: string, sinceUnix: number, untilUnix: number): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/pages`,
      {
        params: {
          since: sinceUnix,
          until: untilUnix,
        }
      }
    );
  }

  // Tag statistics
  public static async getTagsStatistic(pageId: string, sinceUnix: number, untilUnix: number): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/tags`,
      {
        params: {
          since: sinceUnix,
          until: untilUnix,
        }
      }
    );
  }

  // Get User Statistics
  public static async userStatistics(pageId: string, dateRange: string): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/users`,
      {
        params: {
          date_range: dateRange,
        }
      }
    );
  }

  // Get User Statistics Multiple Pages
  public static async userStatisticsMultiplePages(pageIds: string, dateRange: string): Promise<unknown> {
    return this._axios.get(
      "/v1/statistics/user",
      {
        params: {
          page_ids: pageIds,
          date_range: dateRange,
        }
      }
    );
  }

  // Get New Customer Statistics by Time
  public static async newCustomerStatisticsByTime(
    pageId: string,
    dateRange: string,
    groupBy: string = "day"
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `statistics/customers`,
      {
        params: {
          date_range: dateRange,
          group_by: groupBy,
        }
      }
    );
  }

  public static async getPageCustomer(
    pageId: string,
    sinceUnix: number,
    untilUnix: number,
    pageNumber: number
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `page_customers`,
      {
        params: {
          since: sinceUnix,
          until: untilUnix,
          page_number: pageNumber,
          order_by: "updated_at",
        }
      }
    );
  }

  // Call logs
  public static async callLogs(
    id: string,
    pageId: string,
    pageNumber: number = 1,
    pageSize: number = 30,
    since?: number,
    until?: number
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `sip_call_logs`,
      {
        params: {
          id,
          page_number: pageNumber,
          page_size: pageSize,
          since,
          until,
        }
      }
    );
  }

  // Get list tags
  public static async listTags(pageId: string): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(`tags`);
  }

  // Get Posts
  public static async posts(
    pageId: string,
    since: number,
    until: number,
    pageNumber: number = 1,
    pageSize: number = 30
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(
      `posts`,
      {
        params: {
          since,
          until,
          page_number: pageNumber,
          page_size: pageSize,
        }
      }
    );
  }

  // Get the page's user list
  public static async userList(pageId: string): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.get(`users`);
  }

  // Send private reply
  public static async sendPrivateReply(
    pageId: string,
    recipientId: string,
    message: string
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `conversations/${recipientId}/messages`,
      {
        message,
      }
    );
  }

  // Send inbox
  public static async sendInbox(
    pageId: string,
    recipientId: string,
    message: string
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `conversations/${recipientId}/messages`,
      {
        message,
      }
    );
  }

  // Reply comment
  public static async replyComment(
    pageId: string,
    commentId: string,
    message: string
  ): Promise<unknown> {
    const pageClient = await this.getPageClient(pageId);
    return pageClient.post(
      `comments/${commentId}/private_replies`,
      {
        message,
      }
    );
  }
}
