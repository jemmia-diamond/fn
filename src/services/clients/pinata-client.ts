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

interface PinataSecrets {
  jwt: string;
  gateway: string;
}

export default class PinataClient {
  private env: any;
  private pinata: PinataSDK | null = null;
  private secrets: PinataSecrets | null = null;

  constructor(env: any) {
    this.env = env;
  }

  private async getSecrets(): Promise<PinataSecrets> {
    if (this.secrets) {
      return this.secrets;
    }

    if (!this.env.PINATA_JWT_SECRET) {
      throw new Error("PinataClient: PINATA_JWT_SECRET binding is required");
    }

    if (!this.env.PINATA_GATEWAY_SECRET) {
      throw new Error("PinataClient: PINATA_GATEWAY_SECRET binding is required");
    }

    const jwt = await this.env.PINATA_JWT_SECRET.get();
    const gateway = await this.env.PINATA_GATEWAY_SECRET.get();

    this.secrets = { jwt, gateway };
    return this.secrets;
  }

  private async getPinata(): Promise<PinataSDK> {
    if (this.pinata) {
      return this.pinata;
    }

    const { jwt, gateway } = await this.getSecrets();
    this.pinata = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: gateway
    });

    return this.pinata;
  }

  async uploadFile(
    file: File,
    options: PinataUploadOptions = {}
  ): Promise<PinataUploadResult> {
    const pinata = await this.getPinata();
    let builder = pinata.upload.public.file(file);

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
    const pinata = await this.getPinata();
    let builder = pinata.upload.public.json(data);

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
    if (!this.secrets) {
      throw new Error("PinataClient: gateway not initialized");
    }

    return `https://${this.secrets.gateway}/ipfs/${cid}`;
  }
}
