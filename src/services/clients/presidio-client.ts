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
        "Content-Type": "application/json"
      },
      timeout: 0
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

  /**
   * OCR image
   * @param {File | Blob | Buffer} file - The image file, blob or buffer
   * @returns {Promise<{ text: string }>} The OCR result
   */
  async ocr(file: any): Promise<{ text: string }> {
    const formData = new FormData();
    let blob = file;

    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      blob = new Blob([file]);
      // formData.append expects a Blob (or File).
    }

    formData.append("file", blob, file.name || "image.jpg");

    const response = await this.client.post("/ocr", formData, {
      headers: {
        "Content-Type": undefined
      }
    });

    return response.data;
  }
}
