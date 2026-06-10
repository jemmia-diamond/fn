import * as Sentry from "@sentry/cloudflare";
import PinataClient, {
  type PinataUploadOptions,
  type PinataUploadResult
} from "services/clients/pinata-client";

export default class PinataUploadService {
  private client: PinataClient;

  constructor(env: any) {
    this.client = new PinataClient(env);
  }

  async uploadFile(
    file: File,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    try {
      return await this.client.uploadFile(file, options);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          action: "PinataUploadService.uploadFile",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      });
      throw error;
    }
  }

  async uploadJson<T extends Record<string, unknown>>(
    data: T,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    try {
      return await this.client.uploadJson(data, options);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          action: "PinataUploadService.uploadJson",
          dataKeys: Object.keys(data)
        }
      });
      throw error;
    }
  }
}
