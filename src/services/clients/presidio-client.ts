import { createAxiosClient } from "services/utils/http-client";

const BASE_URL = "https://presidio.jemmia.vn";

export default class PresidioClient {
  private env: any;
  private client: any;

  constructor(env: any) {
    this.env = env;
    this.client = this._initClient();
  }

  _initClient() {
    return createAxiosClient({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 0,
    });
  }

  /**
   * Anonymize text
   * @param {Object} payload - The payload for anonymization
   * @returns {Promise<Object>} The anonymized result
   */
  async anonymize(payload: { text: string; language?: "vi" | "en" }): Promise<{
    text: string;
    items: {
      start: number;
      end: number;
      entity_type:
        | "PHONE_NUMBER"
        | "LOCATION"
        | "CREDIT_CARD"
        | "DEFAULT"
        | "EMAIL"
        | "PERSON"
        | "VN_ID"
        | "VN_ADDRESS"
        | string;
      text: string;
      operator: string;
    }[];
  }> {
    const response = await this.client.post("/anonymize", payload);
    return response.data;
  }

  /**
   * Analyze text
   * @param {Object} payload - The payload for analysis
   * @returns {Promise<Object>} The analysis result
   */
  async analyze(payload: { text: string; language?: "vi" | "en" }): Promise<
    {
      start: number;
      end: number;
      score: number;
      analysis_explanation: string | null;
      entity_type:
        | "PHONE_NUMBER"
        | "LOCATION"
        | "CREDIT_CARD"
        | "DEFAULT"
        | "EMAIL"
        | "PERSON"
        | "VN_ID"
        | "VN_ADDRESS"
        | string;
    }[]
  > {
    const response = await this.client.post("/analyze", payload);
    return response.data;
  }
}
