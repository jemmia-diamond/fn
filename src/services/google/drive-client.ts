import GoogleAuth from "services/google/auth.js";
import * as Sentry from "@sentry/cloudflare";
import { createAxiosClient } from "services/utils/http-client";

export default class GoogleDriveClient {
  private env: any;
  private auth: GoogleAuth | null = null;
  private driveBaseUrl = "https://www.googleapis.com/drive/v3";
  private client: ReturnType<typeof createAxiosClient>;

  constructor(env: any) {
    this.env = env;
    this.client = createAxiosClient(
      { baseURL: this.driveBaseUrl, timeout: 30000, headers: {} },
      { retries: 3, retryDelay: (n: number) => Math.pow(2, n) * 1000, retryCondition: (e: any) => !e.response || e.response.status >= 500 }
    );
  }

  private async ensureAuth() {
    if (this.auth) return;

    const jsonKey = this.env.GOOGLE_DRIVE_SA;
    if (!jsonKey) {
      throw new Error("GoogleDriveClient: GOOGLE_DRIVE_SA not set");
    }

    const credentials = JSON.parse(jsonKey);
    this.auth = new GoogleAuth(credentials, ["https://www.googleapis.com/auth/drive.readonly"]);
  }

  private async getHeaders() {
    await this.ensureAuth();
    const token = await this.auth!.getAccessToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  private async request(method: string, path: string, params: Record<string, any> | null = null) {
    const headers = await this.getHeaders();
    const response = await this.client.request({ method, url: path, params, headers });
    return response.data;
  }

  async listFiles(folderId: string) {
    return this.request("GET", "/files", {
      q: `'${folderId}' in parents`,
      fields: "files(id, name, mimeType)",
      pageSize: 1000
    });
  }

  async getFileMetadata(fileId: string, fields = "webContentLink") {
    return this.request("GET", `/files/${fileId}`, { fields });
  }

  async downloadFile(fileId: string) {
    try {
      await this.ensureAuth();
      const token = await this.auth!.getAccessToken();

      const response = await this.client.request({
        method: "GET",
        url: `/files/${fileId}?alt=media`,
        responseType: "arraybuffer",
        headers: { "Authorization": `Bearer ${token}` }
      });

      return { ok: true, body: response.data as ArrayBuffer };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }
}
