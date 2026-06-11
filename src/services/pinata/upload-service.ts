import PinataClient, {
  type PinataUploadOptions,
  type PinataUploadResult
} from "services/clients/pinata-client";
import { downloadToFile } from "services/utils/download-file";

export default class PinataUploadService {
  private client: PinataClient;

  constructor(env: any) {
    this.client = new PinataClient(env);
  }

  uploadFile(
    file: File,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    return this.client.uploadFile(file, options);
  }

  uploadJson<T extends Record<string, unknown>>(
    data: T,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    return this.client.uploadJson(data, options);
  }

  async uploadFromUrls(
    urls: string[],
    options: PinataUploadOptions = {}
  ): Promise<string[]> {
    const results = await Promise.all(
      urls.map(async (url, idx) => {
        const file = await downloadToFile(url, `file-${idx}`);
        const uploaded = await this.client.uploadFile(file, options);
        return uploaded.ipfsUrl;
      })
    );
    return results;
  }
}
