import LarkBaseConnector from "services/clients/lark-connector/base-connector";

/**
 * Lark Message Management connector
 * Handles all messaging operations
 */
export default class MessageManagementConnector extends LarkBaseConnector {
  /**
   * @param {string} appId - Lark App ID
   * @param {string} appSecret - Lark App Secret
   * @param {string} [accessToken] - Pre-existing access token
   * @param {string} [baseURL] - API base URL
   * @param {number} [timeout=30] - Request timeout in seconds
   */
  constructor(appId, appSecret, accessToken = null, baseURL = "https://open.larksuite.com/open-apis", timeout = 30) {
    super(appId, appSecret, accessToken, baseURL, timeout);
  }

  /**
   * Send a message
   * @param {string} receiveIdType - Receive ID type
   * @param {string} receiveId - Receiver ID
   * @param {string} msgType - Message type
   * @param {string|object} content - Message content
   * @param {string} [uuid] - UUID for idempotency
   * @returns {Promise<object>} Sent message data
   */
  async sendMessage(receiveIdType, receiveId, msgType, content, uuid = null) {
    const endpoint = "/im/v1/messages";
    const params = { receive_id_type: receiveIdType };

    const data = this._cleanParams({
      receive_id: receiveId,
      msg_type: msgType,
      content,
      uuid
    });

    return this.post(endpoint, data, params);
  }

  /**
   * Reply to a message
   * @param {string} messageId - Message ID to reply to
   * @param {string|object} content - Reply content
   * @param {string} msgType - Message type
   * @param {boolean} [replyInThread=false] - Reply in thread
   * @param {string} [uuid] - UUID for idempotency
   * @returns {Promise<object>} Reply message data
   */
  async replyMessage(messageId, content, msgType, replyInThread = false, uuid = null) {
    const endpoint = `/im/v1/messages/${messageId}/reply`;

    const data = this._cleanParams({
      content,
      msg_type: msgType,
      reply_in_thread: replyInThread,
      uuid
    });

    return this.post(endpoint, data);
  }

  /**
   * Edit a message
   * @param {string} messageId - Message ID
   * @param {string} msgType - Message type
   * @param {string|object} content - New content
   * @returns {Promise<object>} Updated message
   */
  async editMessage(messageId, msgType, content) {
    const endpoint = `/im/v1/messages/${messageId}`;

    const data = this._cleanParams({
      msg_type: msgType,
      content
    });

    return this.put(endpoint, data);
  }

  /**
   * Recall a message
   * @param {string} messageId - Message ID
   * @returns {Promise<object>} Response data
   */
  async recallMessage(messageId) {
    const endpoint = `/im/v1/messages/${messageId}`;
    return this.delete(endpoint);
  }

  /**
   * Forward a message
   * @param {string} messageId - Message ID
   * @param {string} receiveIdType - Receive ID type
   * @param {string} receiveId - Receiver ID
   * @param {string} [uuid] - UUID for idempotency
   * @returns {Promise<object>} Forwarded message data
   */
  async forwardMessage(messageId, receiveIdType, receiveId, uuid = null) {
    const endpoint = `/im/v1/messages/${messageId}/forward`;
    const params = { receive_id_type: receiveIdType };

    const data = this._cleanParams({
      receive_id: receiveId,
      uuid
    });

    return this.post(endpoint, data, params);
  }

  /**
   * Merge forward messages
   * @param {string} receiveId - Receiver ID
   * @param {string} receiveIdType - Receive ID type
   * @param {Array<string>} messageIdList - List of message IDs
   * @param {string} [uuid] - UUID for idempotency
   * @returns {Promise<object>} Forwarded messages data
   */
  async mergeForwardMessages(receiveId, receiveIdType, messageIdList, uuid = null) {
    const endpoint = "/im/v1/messages/merge_forward";
    const params = { receive_id_type: receiveIdType };

    const data = this._cleanParams({
      receive_id: receiveId,
      message_id_list: messageIdList,
      uuid
    });

    return this.post(endpoint, data, params);
  }

  /**
   * Forward a thread
   * @param {string} threadId - Thread ID
   * @param {string} receiveId - Receiver ID
   * @param {string} receiveIdType - Receive ID type
   * @param {string} [uuid] - UUID for idempotency
   * @returns {Promise<object>} Forwarded thread data
   */
  async forwardThread(threadId, receiveId, receiveIdType, uuid = null) {
    const endpoint = `/im/v1/threads/${threadId}/forward`;
    const params = { receive_id_type: receiveIdType };

    const data = this._cleanParams({
      receive_id: receiveId,
      uuid
    });

    return this.post(endpoint, data, params);
  }

  /**
   * Query read status
   * @param {string} messageId - Message ID
   * @param {string} [userIdType="open_id"] - User ID type
   * @param {number} [pageSize=20] - Page size
   * @param {string} [pageToken] - Page token
   * @returns {Promise<object>} Read status data
   */
  async queryReadStatus(messageId, userIdType = "open_id", pageSize = 20, pageToken = null) {
    const endpoint = `/im/v1/messages/${messageId}/read_users`;

    const params = this._cleanParams({
      user_id_type: userIdType,
      page_size: pageSize,
      page_token: pageToken
    });

    return this.get(endpoint, params);
  }

  /**
   * Get chat history
   * @param {string} containerId - Container ID
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Chat history
   */
  async getChatHistory(containerId, options = {}) {
    const endpoint = "/im/v1/messages";

    const params = this._cleanParams({
      container_id_type: options.containerIdType || "chat",
      container_id: containerId,
      start_time: options.startTime,
      end_time: options.endTime,
      sort_type: options.sortType || "ByCreateTimeAsc",
      page_size: options.pageSize || 20,
      page_token: options.pageToken
    });

    return this.get(endpoint, params);
  }

  /**
   * Obtain resource file
   * @param {string} messageId - Message ID
   * @param {string} fileKey - File key
   * @param {string} resourceType - Resource type
   * @returns {Promise<object>} Resource file data
   */
  async obtainResourceFile(messageId, fileKey, resourceType) {
    const endpoint = `/im/v1/messages/${messageId}/resources/${fileKey}`;
    const params = { type: resourceType };

    return this.get(endpoint, params);
  }

  /**
   * Get message content
   * @param {string} messageId - Message ID
   * @param {string} [userIdType="open_id"] - User ID type
   * @returns {Promise<object>} Message content
   */
  async getMessageContent(messageId, userIdType = "open_id") {
    const endpoint = `/im/v1/messages/${messageId}`;
    const params = { user_id_type: userIdType };

    return this.get(endpoint, params);
  }

  /**
   * Clean parameters by removing null/undefined values
   * @private
   * @param {object} params - Parameters to clean
   * @returns {object} Cleaned parameters
   */
  _cleanParams(params) {
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null)
    );
  }
}
