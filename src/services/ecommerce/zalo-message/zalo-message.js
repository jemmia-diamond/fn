import crypto from "crypto";

export default class ZNSMessageService {
  constructor(env) {
    this.env = env;
  }

  async init() {
    this.clientId = await this.env.ZALO_CLIENT_ID.get();
    this.clientSecret = await this.env.ZALO_CLIENT_SECRET.get();
    this.zaloOAId = await this.env.ZALO_OA_ID.get();
    this.baseURL = env.ZALOPAY_API_BASE_URL;
    if (!this.clientId || !this.clientSecret || !this.zaloOAId || !this.baseURL) {
      throw new Error("ZNSMessageService: Missing required environment variables");
    }
    return this;
  }

  _generateHash(data, secret) {
    return crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");
  }

  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(phone, templateId, templateData) {
    try {
      const requestId = this._generateRequestId();
      
      const payloadObject = {
        phone: phone,
        zalo_oa_id: this.zaloOAId,
        content : {
          template_id: templateId,
          template_data: templateData
        }
      };

      const payload = JSON.stringify(payloadObject);
      const hashData = `${this.clientId}|${requestId}|${payload}`;
      const xClientHash = this._generateHash(hashData, this.clientSecret);

      const headers = {
        "x-client-hash": xClientHash,
        "x-client-id": this.clientId,
        "x-request-id": requestId,
        "Content-Type": "application/json"
      };
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers,
        body: JSON.stringify(payloadObject)
      });

      if (response.status!== 200) {
        const errorData = await response.json();
        throw new Error(`Zalo API error: ${errorData.message}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw error;
    }
  }
}
