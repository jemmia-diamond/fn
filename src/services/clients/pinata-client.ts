import { PinataSDK } from "pinata";

export interface PinataUploadResult {
  id: string;
  name: string;
  cid: string;
  size: number;
  created_at: string;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
  keyvalues: Record<string, string>;
  vectorized: boolean;
  network: string;
  ipfsUrl: string;
}

export interface PinataUploadOptions {
  name?: string;
  keyvalues?: Record<string, string>;
  groupId?: string;
}

export default class PinataClient {
  private pinata: PinataSDK;
  private gateway: string;

  constructor(env: { PINATA_JWT: string; PINATA_GATEWAY: string }) {
    if (!env.PINATA_JWT) {
      throw new Error("PinataClient: PINATA_JWT is required");
    }

    if (!env.PINATA_GATEWAY) {
      throw new Error("PinataClient: PINATA_GATEWAY is required");
    }

    this.gateway = env.PINATA_GATEWAY;
    this.pinata = new PinataSDK({
      pinataJwt: env.PINATA_JWT,
      pinataGateway: env.PINATA_GATEWAY
    });
  }

  async uploadFile(
    file: File,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    let builder = this.pinata.upload.public.file(file);

    if (options.name) {
      builder = builder.name(options.name);
    }

    if (options.keyvalues) {
      builder = builder.keyvalues(options.keyvalues);
    }

    if (options.groupId) {
      builder = builder.group(options.groupId);
    }

    const response = await builder;

    return {
      ...response,
      ipfsUrl: this.buildIpfsUrl(response.cid)
    };
  }

  async uploadJson<T extends Record<string, unknown>>(
    data: T,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    let builder = this.pinata.upload.public.json(data);

    if (options.name) {
      builder = builder.name(options.name);
    }

    if (options.keyvalues) {
      builder = builder.keyvalues(options.keyvalues);
    }

    if (options.groupId) {
      builder = builder.group(options.groupId);
    }

    const response = await builder;

    return {
      ...response,
      ipfsUrl: this.buildIpfsUrl(response.cid)
    };
  }

  buildIpfsUrl(cid: string): string {
    return `https://${this.gateway}/ipfs/${cid}`;
  }
}
