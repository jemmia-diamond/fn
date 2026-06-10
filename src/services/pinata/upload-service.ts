import PinataClient, {
  type PinataUploadOptions,
  type PinataUploadResult
} from "services/clients/pinata-client";

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
}
