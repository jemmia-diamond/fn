import LarkBaseConnector from "services/clients/lark-connector/base-connector";

/**
 * Lark Bitable Record connector
 * Handles all CRUD operations for Bitable table records
 */
export default class RecordConnector extends LarkBaseConnector {
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

  // ==========================================
  // Single Record Operations
  // ==========================================

  /**
   * Get a single record
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {string} recordId - Record ID
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Record data
   */
  async getRecord(appToken, tableId, recordId, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
    const params = this._cleanParams({
      text_field_as_array: options.textFieldAsArray,
      user_id_type: options.userIdType || "open_id",
      display_formula_ref: options.displayFormulaRef,
      with_shared_url: options.withSharedUrl,
      automatic_fields: options.automaticFields
    });

    return this.get(endpoint, params);
  }

  /**
   * List records from a table
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} List response
   */
  async listRecords(appToken, tableId, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    const params = this._cleanParams({
      view_id: options.viewId,
      filter: options.filter,
      sort: options.sort,
      field_names: options.fieldNames,
      text_field_as_array: options.textFieldAsArray,
      user_id_type: options.userIdType || "open_id",
      display_formula_ref: options.displayFormulaRef,
      automatic_fields: options.automaticFields,
      page_token: options.pageToken,
      page_size: options.pageSize || 20
    });

    return this.get(endpoint, params);
  }

  /**
   * Search records with filter
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Search results
   */
  async searchRecords(appToken, tableId, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`;

    const params = this._cleanParams({
      user_id_type: options.userIdType || "open_id",
      page_token: options.pageToken,
      page_size: options.pageSize || 20
    });

    const data = this._cleanParams({
      user_id_type: options.userIdType || "open_id",
      page_token: options.pageToken,
      page_size: options.pageSize || 20,
      view_id: options.viewId,
      field_names: options.fieldNames,
      sort: options.sort,
      filter: options.filter,
      automatic_fields: options.automaticFields || false
    });

    return this.post(endpoint, data, params);
  }

  /**
   * Create a record
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {object} fields - Record fields
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Created record
   */
  async createRecord(appToken, tableId, fields, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records`;

    const data = this._cleanParams({
      fields,
      user_id_type: options.userIdType || "open_id",
      client_token: options.clientToken
    });

    return this.post(endpoint, data);
  }

  /**
   * Update a record
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {string} recordId - Record ID
   * @param {object} fields - Fields to update
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Updated record
   */
  async updateRecord(appToken, tableId, recordId, fields, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;

    const data = this._cleanParams({
      fields,
      user_id_type: options.userIdType || "open_id"
    });

    return this.put(endpoint, data);
  }

  /**
   * Delete a record
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {string} recordId - Record ID
   * @returns {Promise<object>} Response data
   */
  async deleteRecord(appToken, tableId, recordId) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;
    return this.delete(endpoint);
  }

  // ==========================================
  // Batch Operations
  // ==========================================

  /**
   * Batch create records
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {Array<object>} records - Array of field objects
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Created records
   */
  async createRecords(appToken, tableId, records, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`;

    const data = this._cleanParams({
      records: records.map(fields => ({ fields })),
      user_id_type: options.userIdType || "open_id",
      client_token: options.clientToken
    });

    return this.post(endpoint, data);
  }

  /**
   * Batch update records
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {Array<object>} records - Records to update
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Updated records
   */
  async updateRecords(appToken, tableId, records, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_update`;

    const data = this._cleanParams({
      records,
      user_id_type: options.userIdType || "open_id"
    });

    return this.post(endpoint, data);
  }

  /**
   * Batch delete records
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {Array<string>} recordIds - Record IDs to delete
   * @param {object} [options] - Optional parameters
   * @returns {Promise<object>} Response data
   */
  async deleteRecords(appToken, tableId, recordIds, options = {}) {
    const endpoint = `/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_delete`;

    const data = this._cleanParams({
      records: recordIds,
      user_id_type: options.userIdType || "open_id"
    });

    return this.post(endpoint, data);
  }

  /**
   * Delete all records from a table
   * @param {string} appToken - Bitable app token
   * @param {string} tableId - Table ID
   * @param {object} [options] - Optional parameters
   * @returns {Promise<void>}
   */
  async deleteAllRecords(appToken, tableId, options = {}) {
    let pageToken = "";
    const records = [];
    let hasMore = true;

    // Fetch all records
    while (hasMore) {
      const response = await this.listRecords(appToken, tableId, {
        pageToken,
        pageSize: 500,
        userIdType: options.userIdType
      });

      const responseData = response.data;
      hasMore = responseData.has_more;
      pageToken = responseData.page_token || null;
      records.push(...responseData.items);
    }

    // Delete in batches
    const recordIds = records.map(row => row.record_id);
    const batchSize = 500;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      await this.deleteRecords(appToken, tableId, batch, options);
    }
  }

  // ==========================================
  // Helper Methods
  // ==========================================

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
