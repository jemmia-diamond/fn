import * as Sentry from "@sentry/cloudflare";
import axios from "axios";

export default class MisaClient {
  static RETRIEVABLE_LIMIT = 1000;

  constructor(env) {
    this.env = env;
    this.baseUrl = "https://actapp.misa.vn";
    this.accessToken = null;
  }

  /**
   * Get access token from MISA API, this function should be called before any other function
   * @returns String access token (save to instance variable)
   */
  async getAccessToken() {
    const url = `${this.baseUrl}/api/oauth/actopen/connect`;

    try {
      const payload = {
        app_id: this.env.MISA_APP_ID,
        access_code: await this.env.MISA_ACCESS_CODE_SECRET.get(),
        org_company_code: this.env.MISA_ORG_CODE
      };

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" }
      });
      this.accessToken = JSON.parse(response.data.Data).access_token;
      return this.accessToken;
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  /**
   * Save the Accounting Document Proposal to MISA
   * @param {*} voucherPayload
   * @returns
   */
  async saveVoucher(voucherPayload) {
    const url = `${this.baseUrl}/apir/sync/actopen/save`;

    try {
      const response = await axios.post(url, voucherPayload, {
        headers: {
          "X-MISA-AccessToken": this.accessToken,
          "Content-Type": "application/json"
        }
      });
      return response.data;
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  /**
   * Return list of configured bank info in MISA
   * @param {Number} data_type - type of dictionary, check here https://actdocs.misa.vn/g2/graph/ACTOpenAPIHelp/index.html#3-3
   * @param {Number} skip
   * @returns
   */
  async getDictionary(data_type, skip = 0, take = RETRIEVABLE_LIMIT, last_sync_time = null) {
    const url = `${this.baseUrl}/apir/sync/actopen/get_dictionary`;
    const payload = {
      data_type, skip, take, last_sync_time,
      app_id: this.env.MISA_APP_ID
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "X-MISA-AccessToken": this.accessToken,
          "Content-Type": "application/json"
        }
      });
      return JSON.parse(response.data.Data);
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
