import GoogleAuth from "services/google/auth.js";
import * as Sentry from "@sentry/cloudflare";

export default class GoogleDriveClient {
  private env: any;
  private auth: GoogleAuth | null = null;
  private driveBaseUrl = "https://www.googleapis.com/drive/v3";

  constructor(env: any) {
    this.env = env;
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
    const url = new URL(`${this.driveBaseUrl}${path}`);

    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
    }

    const response = await fetch(url.toString(), { method, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API error: ${response.status} ${errorText}`);
    }

    return response.json();
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
    await this.ensureAuth();
    const token = await this.auth!.getAccessToken();

    const response = await fetch(`${this.driveBaseUrl}/files/${fileId}?alt=media`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      Sentry.captureMessage(`Google Drive download error: ${response.status} ${errorText}`);
      return null;
    }

    return response;
  }
}
