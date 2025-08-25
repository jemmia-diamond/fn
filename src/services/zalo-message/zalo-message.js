import crypto from "crypto";

export default class ZNSMessageService {
  constructor(env) {
    this.env = env;
  }

  _generateHash(data, secret) {
    return crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");
  }

  _generateRequestId() {
    return `req_${Date.now()}`;
  }

  async sendMessage(phone, templateId, templateData) {
    try {
      const requestId = this._generateRequestId();
      this.clientId = this.env.ZNS_CLIENT_ID;
      this.zaloOAId = this.env.ZNS_OA_ID;
      this.baseURL = this.env.ZNS_API_BASE_URL;
      this.clientSecret = this.env.ZNS_SECRET_KEY || await this.env.ZNS_SECRET_KEY_SECRET.get();

      const payloadObject = {
        phone: phone,
        zalo_oa_id: this.zaloOAId,
        content: {
          template_id: templateId,
          template_data: templateData
        },
        callback_url: ""
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
      const endpoint = `${this.baseURL}/zns-partner/v1/messages`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payloadObject)
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        console.error("Zalo API request failed:", {
          status: response.status,
          body: data
        });
        throw new Error(`Zalo API error: ${text}`);
      }

      return data;
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw error;
    }
  }
}
