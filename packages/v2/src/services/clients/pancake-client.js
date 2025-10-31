import axios from "axios";

export default class PancakeClient {
  constructor(env) {
    this.env = env;
    this.baseUrl = "https://pages.fm";
    this.accessToken = env.PANCAKE_ACCESS_TOKEN;
    this.pageAccessTokens = {};
  }

  /**
   * @param {string} pageId - The ID of the page.
   * @returns {Promise<string>} The page access token.
   */
  async getPageAccessToken(pageId) {
    if (this.pageAccessTokens[pageId]) {
      return this.pageAccessTokens[pageId];
    }

    const url = `${this.baseUrl}/api/v1/pages/${pageId}/generate_page_access_token`;
    try {
      const response = await axios.post(url, null, {
        params: {
          page_id: pageId,
          access_token: this.accessToken
        }
      });
      const token = response.data.page_access_token || response.data.token;
      if (!token) {
        throw new Error("Could not find page_access_token in API response.");
      }
      this.pageAccessTokens[pageId] = token;
      return token;
    } catch (error) {
      throw new Error(`Failed to generate page access token for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves a list of pages associated with the user account.
   * @returns {Promise<Array>} A list of page objects.
   */
  async listPages() {
    const url = `${this.baseUrl}/api/v1/pages`;
    try {
      const response = await axios.get(url, {
        params: { access_token: this.accessToken }
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error("Failed to retrieve pages list.", error.response?.data || error.message);
    }
  }

  /**
   * Retrieves a list of conversations for a specific page using API v2.
   * @param {string} pageId - The ID of the page.
   * @param {object} options - Optional parameters for filtering.
   * @param {string} options.last_conversation_id - For pagination.
   * @param {string} options.tags - Comma-separated tag IDs (e.g., "1,2,3").
   * @param {Array<string>} options.type - Array of conversation types (e.g., ["INBOX", "COMMENT"]).
   * @param {Array<string>} options.post_ids - Array of post IDs (requires type: "POST").
   * @param {number} options.since - Start timestamp (Unix seconds, UTC+0).
   * @param {number} options.until - End timestamp (Unix seconds, UTC+0).
   * @param {boolean} options.unread_first - Sort unread conversations first.
   * @param {string} options.order_by - Sort by 'inserted_at' or 'updated_at'.
   * @returns {Promise<Array>} A list of conversation objects.
   */
  async getConversations(pageId, options = {}) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v2/pages/${pageId}/conversations`;
    try {
      const response = await axios.get(url, {
        params: {
          page_access_token: pageAccessToken,
          page_id: pageId,
          ...options
        }
      });
      return response.data.conversations || [];
    } catch (error) {
      throw new Error(`Failed to get conversations for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Adds or removes a tag from a conversation.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} action - The action to perform ('add' or 'remove').
   * @param {string} tagId - The ID of the tag.
   * @returns {Promise<object>} The result of the operation.
   */
  async tagConversation(pageId, conversationId, action, tagId) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/tags`;
    const payload = { action, tag_id: tagId };
    try {
      const response = await axios.post(url, payload, {
        params: { page_id: pageId, page_access_token: pageAccessToken, conversation_id: conversationId }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to tag conversation ${conversationId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Assigns one or more users to a conversation.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @param {Array<string>} assigneeIds - An array of user IDs to assign.
   * @returns {Promise<object>} The result of the operation.
   */
  async assignConversation(pageId, conversationId, assigneeIds) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/assign`;
    const payload = { assignee_ids: assigneeIds };
    try {
      const response = await axios.post(url, payload, {
        params: { page_id: pageId, page_access_token: pageAccessToken, conversation_id: conversationId }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to assign conversation ${conversationId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Marks a conversation as read.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<object>} The result of the operation.
   */
  async markConversationRead(pageId, conversationId) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/read`;
    try {
      const response = await axios.post(url, null, {
        params: { page_id: pageId, conversation_id: conversationId, page_access_token: pageAccessToken }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to mark conversation ${conversationId} as read.`, error.response?.data || error.message);
    }
  }

  /**
   * Marks a conversation as unread.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<object>} The result of the operation.
   */
  async markConversationUnread(pageId, conversationId) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/unread`;
    try {
      const response = await axios.post(url, null, {
        params: { page_id: pageId, conversation_id: conversationId, page_access_token: pageAccessToken }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to mark conversation ${conversationId} as unread.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves messages within a specific conversation.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @param {number} currentCount - The index for pagination (total messages already fetched).
   * @returns {Promise<Array>} A list of message objects.
   */
  async getMessages(pageId, conversationId, currentCount = 0) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/messages`;
    try {
      const response = await axios.get(url, {
        params: {
          page_access_token: pageAccessToken,
          conversation_id: conversationId,
          page_id: pageId,
          current_count: currentCount
        }
      });
      return response.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to get messages for conversation ${conversationId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves campaign statistics for a given page and time range.
   * @param {string} pageId - The ID of the page.
   * @param {number} since - The start timestamp (Unix seconds, UTC+0).
   * @param {number} until - The end timestamp (Unix seconds, UTC+0).
   * @returns {Promise<Array>} An array of campaign statistics objects.
   */
  async getCampaignStatistics(pageId, since, until) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/pages_campaigns`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken, since, until }
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get campaign statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves ad statistics for a given page, time range, and type.
   * @param {string} pageId - The ID of the page.
   * @param {number} since - The start timestamp (Unix seconds, UTC+0).
   * @param {number} until - The end timestamp (Unix seconds, UTC+0).
   * @param {string} type - The type of data option. ('by_id' or 'by_time')
   * @returns {Promise<Array>} An array of ad statistics objects.
   */
  async getAdsStatistics(pageId, since, until, type) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/ads`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken, since, until, type }
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get ads statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves engagement statistics for a page.
   * @param {string} pageId - The ID of the page.
   * @param {string} dateRange - Date range string (e.g. '27/07/2021 00:00:00 - 26/08/2021 23:59:59').
   * @param {Object} options - Optional params (by_hour: boolean, user_ids: string)
   * @returns {Promise<Object>} Engagement statistics response.
   */
  async getEngagementStatistics(pageId, dateRange, options = {}) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/customer_engagements`;
    try {
      const params = {
        page_access_token: pageAccessToken,
        date_range: dateRange,
        ...options
      };
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get engagement statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves page statistics for a given time range.
   * @param {string} pageId - The ID of the page.
   * @param {number} since - The start timestamp (Unix seconds, UTC+0).
   * @param {number} until - The end timestamp (Unix seconds, UTC+0).
   * @returns {Promise<Array>} An array of statistics objects.
   */
  async getPageStatistics(pageId, since, until) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/pages`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken, since, until }
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves user (employee) statistics for a page in a specific date range.
   * @param {string} pageId - The page ID.
   * @param {string} dateRange - Date range string (e.g. '27/07/2021 00:00:00 - 26/08/2021 23:59:59').
   * @returns {Promise<Array<object>>} Array of user statistics objects.
   * API: GET /public_api/v1/pages/:page_id/statistics/users
   */
  async getUserStatistics(pageId, dateRange) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/users`;
    try {
      const params = {
        page_access_token: pageAccessToken,
        date_range: dateRange
      };
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get user statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves users' statistics across multiple pages.
   * @param {string[]} pageIds - Array of page IDs to aggregate statistics for.
   * @param {string} dateRange - Date range string (e.g. '05/08/2022 00:00:00 - 06/08/2022 23:59:59').
   * @returns {Promise<Array<object>>} Array of user statistics objects.
   * API: GET /api/v1/statistics/user
   * Requires access_token from account personal settings.
   */
  async getMultiPageUserStatistics(pageIds, dateRange) {
    const url = `${this.baseUrl}/api/v1/statistics/user`;
    const accessToken = this.accessToken;
    try {
      const params = {
        access_token: accessToken,
        page_ids: Array.isArray(pageIds) ? pageIds.join(",") : pageIds,
        date_range: dateRange
      };
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error("Failed to get multi-page user statistics.", error.response?.data || error.message);
    }
  }

  /**
   * Retrieves tag statistics (conversation tag statistics) for a page.
   * @param {string} pageId - The page ID.
   * @param {number} since - Start time as unix timestamp (seconds, UTC+0).
   * @param {number} until - End time as unix timestamp (seconds, UTC+0).
   * @returns {Promise<Array<object>>} Array of tag statistics objects.
   * API: GET /public_api/v1/pages/:page_id/statistics/tags
   */
  async getTagStatistics(pageId, since, until) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/tags`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken, since, until }
      });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get tag statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves user (employee) statistics for a page in a specific date range.
   * @param {string} pageId - The page ID.
   * @param {string} dateRange - Date range string (e.g. '27/07/2021 00:00:00 - 26/08/2021 23:59:59').
   * @returns {Promise<Array<object>>} Array of user statistics objects.
   * API: GET /public_api/v1/pages/:page_id/statistics/users
   */
  async getUserStatistics(pageId, dateRange) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/statistics/users`;
    try {
      const params = {
        page_access_token: pageAccessToken,
        date_range: dateRange
      };
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get user statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves statistics of new customers over time for a given page.
   * @param {string} pageId - The page ID.
   * @param {string} dateRange - Date range (e.g. '20/07/2020 - 20/08/2020').
   * @param {string} [groupBy='day'] - Method to group data: 'day' (default), 'hour', or 'page_id'.
   * @returns {Promise<Object>} Customer statistics object by selected grouping.
   * API: GET /public_api/v1/pages/:page_id/page_customers
   */
  async getNewCustomerStatistics(pageId, dateRange, groupBy = "day") {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/page_customers`;
    try {
      const params = {
        page_access_token: pageAccessToken,
        date_range: dateRange,
        group_by: groupBy,
        page_id: pageId
      };
      const response = await axios.get(url, { params });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(`Failed to get new customer statistics for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves conversations from ads (exported backup), paginated by offset, sorted by ascending time.
   * @param {string} pageId - The page ID.
   * @param {number} since - Start time as unix timestamp (seconds, UTC+0).
   * @param {number} until - End time as unix timestamp (seconds, UTC+0).
   * @param {number} [offset=0] - Offset for pagination (default 0, increase by 60 for next page).
   * @returns {Promise<Array<object>>} Array of conversation objects from ads.
   * API: GET /public_api/v1/pages/:page_id/export_data
   * Requires action='conversations_from_ads'.
   */
  async getConversationsFromAds(pageId, since, until, offset = 0) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/export_data`;
    try {
      const params = {
        page_id: pageId,
        page_access_token: pageAccessToken,
        since,
        until,
        action: "conversations_from_ads",
        offset
      };
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get conversations from ads for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves detailed customer information for a page with pagination and sorting.
   * @param {string} pageId - The page ID.
   * @param {number} since - Start time as unix timestamp (seconds, UTC+0).
   * @param {number} until - End time as unix timestamp (seconds, UTC+0).
   * @param {number} pageNumber - Current page number (min 1).
   * @param {number} [pageSize=100] - Page size (max 100).
   * @param {string} [orderBy='inserted_at'] - Sort order: 'inserted_at' (default) or 'updated_at'.
   * @returns {Promise<Object>} Customers data response with paging.
   * API: GET /public_api/v1/pages/:page_id/page_customers
   */
  async getPageCustomers(pageId, since, until, pageNumber, pageSize = 100, orderBy = "inserted_at") {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/page_customers`;
    try {
      const params = {
        page_id: pageId,
        page_access_token: pageAccessToken,
        since,
        until,
        page_number: pageNumber,
        page_size: pageSize,
        order_by: orderBy
      };
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customers info for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Updates information for a specific page customer.
   * @param {string} pageId - The page ID.
   * @param {string} pageCustomerId - The customer ID to update (from page customers list).
   * @param {object} changes - Changes object. Fields: gender ("male"|"female"|"unknown"), birthday ("YYYY-MM-DD"), phone_numbers (array), name (string).
   * @returns {Promise<object>} The updated customer info response.
   * API: PUT /public_api/v1/pages/:page_id/page_customers/:page_customer_id
   */
  async updatePageCustomer(pageId, pageCustomerId, changes) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/page_customers/${pageCustomerId}`;
    try {
      const params = {
        page_id: pageId,
        page_customer_id: pageCustomerId,
        page_access_token: pageAccessToken
      };
      // Only send valid fields in 'changes' object
      const data = { ...changes };
      const response = await axios.put(url, data, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer info for customer ${pageCustomerId} on page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves SIP call logs for a page by SIP package.
   * @param {string|number} pageId - Page ID.
   * @param {string|number} id - Call package (SIP) ID.
   * @param {number} pageNumber - Current page number (min 1).
   * @param {number} pageSize - Page size (max 30).
   * @param {number} [since] - Start timestamp (unix seconds, UTC+0).
   * @param {number} [until] - End timestamp (unix seconds, UTC+0).
   * @returns {Promise<Object>} Call logs data for the SIP package and page.
   * API: GET /public_api/v1/pages/:page_id/sip_call_logs
   */
  async getCallLogs(pageId, id, pageNumber, pageSize, since, until) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/sip_call_logs`;
    try {
      const params = {
        id,
        page_access_token: pageAccessToken,
        page_number: pageNumber,
        page_size: pageSize,
        page_id: pageId
      };
      if (since !== undefined) params.since = since;
      if (until !== undefined) params.until = until;
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get call logs for page ${pageId} (SIP ID: ${id}).`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves all tags created on the page.
   * @param {string} pageId - The page ID.
   * @returns {Promise<Array<object>>} Array of tag objects: { id, text, ... }.
   * API: GET /public_api/v1/pages/:page_id/tags
   */
  async listTags(pageId) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/tags`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken }
      });
      return response.data.tags || [];
    } catch (error) {
      throw new Error(`Failed to list tags for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves users (members/admins) of a page.
   * @param {string} pageId - The page ID.
   * @returns {Promise<object>} An object including: users (array), disabled_users, round_robin_users.
   * Each user object contains at least: { id, name, ... }.
   * API: GET /public_api/v1/pages/:page_id/users
   */
  async listUsers(pageId) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/users`;
    try {
      const response = await axios.get(url, {
        params: { page_id: pageId, page_access_token: pageAccessToken }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list users for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Retrieves posts from a page with pagination, time filtering, and optional type filter.
   * @param {string} pageId - The page ID.
   * @param {number} since - Start time as unix timestamp (seconds, UTC+0).
   * @param {number} until - End time as unix timestamp (seconds, UTC+0).
   * @param {number} pageNumber - Current page number (min 1).
   * @param {number} pageSize - Page size (max 30).
   * @param {string} [type] - Filter posts by type ('video', 'photo', 'text', 'livestream').
   * @returns {Promise<Object>} The posts data object (with paging info).
   * API: GET /public_api/v1/pages/:page_id/posts
   */
  async getPagePosts(pageId, since, until, pageNumber, pageSize, type) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/posts`;
    try {
      const params = {
        page_id: pageId,
        page_access_token: pageAccessToken,
        since,
        until,
        page_number: pageNumber,
        page_size: pageSize
      };
      if (type) params.type = type;
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get posts for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Updates round robin users for message and comment assignments on a page.
   * @param {string} pageId - The page ID.
   * @param {Array<string>} inbox - Array of user IDs for inbox assignment.
   * @param {Array<string>} comment - Array of user IDs for comment assignment.
   * @returns {Promise<object>} API response containing success and message fields.
   * API: POST /public_api/v1/pages/:page_id/round_robin_users
   */
  async updateRoundRobinUsers(pageId, inbox, comment) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/round_robin_users`;
    try {
      const params = {
        page_id: pageId,
        page_access_token: pageAccessToken
      };
      const data = { inbox, comment };
      const response = await axios.post(url, data, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update round robin users for page ${pageId}.`, error.response?.data || error.message);
    }
  }

  /**
   * Sends a private message from a comment.
   * @param {string} pageId - The ID of the page.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} postId - The ID of the post containing the comment.
   * @param {string} messageId - The ID of the comment to reply to privately.
   * @param {string} message - The text content of the private reply.
   * @returns {Promise<object>} The result of the operation.
   * API: POST /public_api/v1/pages/:page_id/conversations/:conversation_id/messages
   * Set { action: 'private_replies', post_id, message_id, message } in body.
   */
  async sendPrivateReply(pageId, conversationId, postId, messageId, message) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const url = `${this.baseUrl}/api/public_api/v1/pages/${pageId}/conversations/${conversationId}/messages`;
    const payload = { action: "private_replies", post_id: postId, message_id: messageId, message };
    try {
      const response = await axios.post(url, payload, {
        params: { page_access_token: pageAccessToken },
        headers: { page_id: pageId, conversation_id: conversationId }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to send private reply to comment ${messageId}.`, error.response?.data || error.message
      );
    }
  }
}
