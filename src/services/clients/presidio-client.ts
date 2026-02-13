import { createAxiosClient } from "services/utils/http-client";
import { Jimp } from "jimp";

const BASE_URL = "https://presidio.jemmia.vn";

export interface AnalyzeImageResponse {
  has_handwriting: boolean;
  ner_results: {
    entity_type: string;
    text: string;
    score: number;
    box: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  }[];
  ocr_results: {
    text: string;
    confidence: number;
    box: {
      left: number;
      top: number;
      width: number;
      height: number;
      points?: number[][];
    };
  }[];
}

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
      headers: {},
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
      blob = new Blob([file], { type: "image/jpeg" });
      // formData.append expects a Blob (or File).
    }

    formData.append("file", blob, (file as any).name || "image.jpg");

    const response = await this.client.post("/ocr", formData);
    return response.data;
  }

  /**
   * Anonymize image
   * @param {File | Blob | Buffer} file - The image file, blob or buffer
   * @returns {Promise<{ has_sensitive_info: boolean; image: string }>} The anonymization result
   */
  async anonymizeImage(
    file: any
  ): Promise<{ has_sensitive_info: boolean; image: string }> {
    let inputBuffer: Buffer;

    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      inputBuffer = file;
    } else {
      // Fallback for non-buffer inputs (though primarily used with Buffer)
      console.warn(
        "PresidioClient: Input file is not a Buffer, skipping resize."
      );
      // If it's a blob, we can't easily resize with Jimp without conversion.
      // Pass through.
      const formData = new FormData();
      formData.append("file", file, (file as any).name || "image.jpg");
      const response = await this.client.post("/anonymize-image", formData);
      return response.data;
    }

    // Resize logic
    try {
      const image = await Jimp.read(inputBuffer);
      if (image.width > 1024 || image.height > 1024) {
        if (image.width > image.height) {
          image.resize({ w: 1024 });
        } else {
          image.resize({ h: 1024 });
        }
        inputBuffer = await image.getBuffer("image/jpeg");
      }
    } catch (error) {
      console.warn("PresidioClient: Failed to resize image:", error);
      // Continue with original buffer
    }

    const formData = new FormData();
    const blob = new Blob([inputBuffer], { type: "image/jpeg" });

    formData.append("file", blob, (file as any).name || "image.jpg");

    const response = await this.client.post("/anonymize-image", formData);
    return response.data;
  }

  /**
   * Analyze image
   * @param {File | Blob | Buffer} file - The image file, blob or buffer
   * @returns {Promise<AnalyzeImageResponse>} The analysis result
   */
  async analyzeImage(file: any): Promise<AnalyzeImageResponse> {
    let inputBuffer: Buffer;

    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      inputBuffer = file;
    } else {
      // Fallback for non-buffer inputs (though primarily used with Buffer)
      console.warn(
        "PresidioClient: Input file is not a Buffer, skipping resize."
      );
      // If it's a blob, we can't easily resize with Jimp without conversion.
      // Pass through.
      const formData = new FormData();
      formData.append("file", file, (file as any).name || "image.jpg");
      const response = await this.client.post("/analyze-image", formData);
      return response.data;
    }

    // Resize logic
    try {
      const image = await Jimp.read(inputBuffer);
      if (image.width > 1024 || image.height > 1024) {
        if (image.width > image.height) {
          image.resize({ w: 1024 });
        } else {
          image.resize({ h: 1024 });
        }
        inputBuffer = await image.getBuffer("image/jpeg");
      }
    } catch (error) {
      console.warn("PresidioClient: Failed to resize image:", error);
      // Continue with original buffer
    }

    const formData = new FormData();
    const blob = new Blob([inputBuffer], { type: "image/jpeg" });

    formData.append("file", blob, (file as any).name || "image.jpg");

    const response = await this.client.post("/analyze-image", formData);
    return response.data;
  }
}
