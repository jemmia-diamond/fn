import axios from "axios";

export default class NocoDBClient {

  /**
   * @param {string} baseUrl - Base URL for NocoDB.
   * @param {string} apiToken - API Token for authentication.
   */
  constructor(baseUrl, apiToken) {
    this.baseUrl = baseUrl ? baseUrl.replace(/\/$/, "") : "https://app.nocodb.com";
    this.apiToken = apiToken;

    if (!this.apiToken) {
      console.warn("NocoDBClient: apiToken is missing.");
    }
  }

  _getConfig() {
    return {
      headers: {
        "xc-token": this.apiToken
      }
    };
  }

  // ==========================================
  // Table Records Operations
  // ==========================================

  /**
   * List records from a table.
   * @param {string} tableId - The ID of the table.
   * @param {object} [params] - Query parameters.
   * @param {string} [params.fields] - Comma-separated list of fields to include.
   * @param {string} [params.sort] - Comma-separated list of fields to sort by.
   * @param {string} [params.where] - Filter conditions.
   * @param {number} [params.offset] - Number of records to skip.
   * @param {number} [params.limit] - Number of records to return.
   * @param {string} [params.viewId] - View ID to filter by view.
   * @returns {Promise<object>} The response data containing list of records and pageInfo.
   */
  async listRecords(tableId, params = {}) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records`;
    try {
      const config = {
        ...this._getConfig(),
        params
      };
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list records for table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Read a single record.
   * @param {string} tableId - The ID of the table.
   * @param {string|number} recordId - The ID of the record.
   * @param {object} [params] - Query parameters.
   * @param {string} [params.fields] - Comma-separated list of fields to include.
   * @returns {Promise<object>} The record object.
   */
  async readRecord(tableId, recordId, params = {}) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records/${recordId}`;
    try {
      const config = {
        ...this._getConfig(),
        params
      };
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to read record ${recordId} from table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Create new records.
   * @param {string} tableId - The ID of the table.
   * @param {object|Array<object>} data - The record data or array of record data to create.
   * @returns {Promise<object>} The created record(s).
   */
  async createRecords(tableId, data) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records`;
    try {
      const response = await axios.post(url, data, this._getConfig());
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create records in table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Update existing records.
   * @param {string} tableId - The ID of the table.
   * @param {object|Array<object>} data - The record data or array of record data to update. Must include 'Id'.
   * @returns {Promise<object>} The updated record(s).
   */
  async updateRecords(tableId, data) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records`;
    try {
      const response = await axios.patch(url, data, this._getConfig());
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update records in table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Delete records.
   * @param {string} tableId - The ID of the table.
   * @param {Array<object>} data - Array of objects containing IDs to delete (e.g. [{ Id: 1 }, { Id: 2 }]).
   * @returns {Promise<object>} The result of the delete operation.
   */
  async deleteRecords(tableId, data) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records`;
    try {
      const config = {
        ...this._getConfig(),
        data
      };
      const response = await axios.delete(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete records from table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Count records in a table.
   * @param {string} tableId - The ID of the table.
   * @param {object} [params] - Query parameters.
   * @param {string} [params.viewId] - View ID to filter by view.
   * @param {string} [params.where] - Filter conditions.
   * @returns {Promise<object>} Object containing the count (e.g., { count: 3 }).
   */
  async countRecords(tableId, params = {}) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/records/count`;
    try {
      const config = {
        ...this._getConfig(),
        params
      };
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to count records for table ${tableId}.`, { cause: error.response?.data || error.message });
    }
  }

  // ==========================================
  // Nested Relations (Links) Operations
  // ==========================================

  /**
   * List linked records.
   * @param {string} tableId - The ID of the table.
   * @param {string} linkFieldId - The ID of the link field.
   * @param {string|number} recordId - The ID of the record.
   * @param {object} [params] - Query parameters.
   * @param {string} [params.fields] - Comma-separated list of fields to include.
   * @param {string} [params.sort] - Comma-separated list of fields to sort by.
   * @param {string} [params.where] - Filter conditions.
   * @param {number} [params.offset] - Number of records to skip.
   * @param {number} [params.limit] - Number of records to return.
   * @returns {Promise<object>} The response data containing list of linked records and pageInfo.
   */
  async listLinkedRecords(tableId, linkFieldId, recordId, params = {}) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`;
    try {
      const config = {
        ...this._getConfig(),
        params
      };
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list linked records for table ${tableId}, link ${linkFieldId}, record ${recordId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Link records.
   * @param {string} tableId - The ID of the table.
   * @param {string} linkFieldId - The ID of the link field.
   * @param {string|number} recordId - The ID of the record.
   * @param {Array<object>} data - Array of objects containing IDs to link (e.g. [{ Id: 4 }, { Id: 5 }]).
   * @returns {Promise<boolean>} True if successful.
   */
  async linkRecords(tableId, linkFieldId, recordId, data) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`;
    try {
      const response = await axios.post(url, data, this._getConfig());
      return response.data;
    } catch (error) {
      throw new Error(`Failed to link records for table ${tableId}, link ${linkFieldId}, record ${recordId}.`, { cause: error.response?.data || error.message });
    }
  }

  /**
   * Unlink records.
   * @param {string} tableId - The ID of the table.
   * @param {string} linkFieldId - The ID of the link field.
   * @param {string|number} recordId - The ID of the record.
   * @param {Array<object>} data - Array of objects containing IDs to unlink (e.g. [{ Id: 1 }, { Id: 2 }]).
   * @returns {Promise<boolean>} True if successful.
   */
  async unlinkRecords(tableId, linkFieldId, recordId, data) {
    const url = `${this.baseUrl}/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`;
    try {
      const config = {
        ...this._getConfig(),
        data
      };
      const response = await axios.delete(url, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unlink records for table ${tableId}, link ${linkFieldId}, record ${recordId}.`, { cause: error.response?.data || error.message });
    }
  }

  // ==========================================
  // Storage Operations
  // ==========================================

  /**
   * Upload attachment.
   * @param {object} params - Query parameters.
   * @param {string} params.path - Target file path (e.g. "download/noco/...").
   * @param {string} [params.scope] - Scope of attachment ("workspacePics", "profilePics", "organizationPics").
   * @param {FormData|object} fileData - The multipart/form-data payload.
   *        Should contain: mimetype, path, size, title, url (optional), and the file content.
   *        If using 'form-data' library or browser FormData, pass it directly.
   * @returns {Promise<object>} The upload response.
   */
  async uploadAttachment(params, fileData) {
    const url = `${this.baseUrl}/api/v2/storage/upload`;
    try {
      const config = {
        ...this._getConfig(),
        params,
        headers: {
          ...this._getConfig().headers,
          ...(fileData.getHeaders ? fileData.getHeaders() : {})
        }
      };
      const response = await axios.post(url, fileData, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to upload attachment.", { cause: error.response?.data || error.message });
    }
  }
}
