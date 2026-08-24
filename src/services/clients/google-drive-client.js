import axios from "axios";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

/**
 * Lightweight Google Drive client for Cloudflare Workers.
 * Uses service account JWT auth via Web Crypto API.
 */
export default class GoogleDriveClient {
  #accessToken;
  #tokenExpiry;
  #serviceAccountKey;

  /**
   * @param {string} serviceAccountKeyJson - JSON string of the service account key
   */
  constructor(serviceAccountKeyJson) {
    this.#serviceAccountKey = JSON.parse(serviceAccountKeyJson);
    this.#accessToken = null;
    this.#tokenExpiry = 0;
  }

  async #getAccessToken() {
    if (this.#accessToken && Date.now() < this.#tokenExpiry) {
      return this.#accessToken;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: this.#serviceAccountKey.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600
    };

    const jwt = await this.#signJwt(header, payload);

    const response = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    this.#accessToken = response.data.access_token;
    this.#tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.#accessToken;
  }

  async #signJwt(header, payload) {
    const encoder = new TextEncoder();

    const headerB64 = this.#base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.#base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${headerB64}.${payloadB64}`;

    const privateKey = await this.#importPrivateKey(
      this.#serviceAccountKey.private_key
    );
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      privateKey,
      encoder.encode(unsignedToken)
    );

    const signatureB64 = this.#base64UrlEncode(signature);
    return `${unsignedToken}.${signatureB64}`;
  }

  async #importPrivateKey(pem) {
    const pemContents = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\n/g, "");

    const binaryDer = Uint8Array.from(atob(pemContents), (c) =>
      c.charCodeAt(0)
    );

    return crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }

  #base64UrlEncode(data) {
    let base64;
    if (typeof data === "string") {
      base64 = btoa(data);
    } else {
      const bytes = new Uint8Array(data);
      let binary = "";
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      base64 = btoa(binary);
    }
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /**
   * List files in a Google Drive folder
   * @param {string} folderId
   * @returns {Promise<Array<{id: string, name: string, mimeType: string}>>}
   */
  async listFiles(folderId) {
    const token = await this.#getAccessToken();
    const response = await axios.get(`${DRIVE_API_BASE}/files`, {
      params: {
        q: `'${folderId}' in parents`,
        fields: "files(id, name, mimeType)"
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.files || [];
  }

  /**
   * Get a file's webContentLink for direct download
   * @param {string} fileId
   * @returns {Promise<string|null>}
   */
  async getWebContentLink(fileId) {
    const token = await this.#getAccessToken();
    const response = await axios.get(`${DRIVE_API_BASE}/files/${fileId}`, {
      params: { fields: "webContentLink" },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.webContentLink || null;
  }

  /**
   * Download a file from Google Drive as an ArrayBuffer
   * @param {string} fileId
   * @returns {Promise<ArrayBuffer>}
   */
  async downloadFile(fileId) {
    const token = await this.#getAccessToken();
    const response = await axios.get(`${DRIVE_API_BASE}/files/${fileId}`, {
      params: { alt: "media" },
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
