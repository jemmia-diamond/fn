import crypto from "crypto";

export default class ZNSMessageService {
  constructor(env) {
    this.clientId = env.ZNS_CLIENT_ID;
    this.clientSecret = env.ZNS_SECRET_KEY_SECRET;
    this.zaloOAId = env.ZNS_OA_ID;
    this.baseURL = env.ZNS_API_BASE_URL;
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
      const response = await fetch(this.baseURL + "/zns-partner/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify(payloadObject)
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(`Zalo API error: ${data?.message || "Unknown error"}`);
      }

      return data;
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw error;
    }
  }
}
