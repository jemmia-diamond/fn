import PinataUploadService from "services/pinata/upload-service";
import ViemClient, { getActiveChainConfig } from "services/clients/viem-client.js";
import ViemContractService from "services/viem/viem-contract-service";
import { downloadToFile } from "services/utils/download-file";

export function getDiamondCertificateSmartContractAddress(env: any): `0x${string}` {
  const addr = env.DIAMOND_CERTIFICATE_SMARTCONTRACT_ADDRESS;
  if (!addr) {
    throw new Error("DIAMOND_CERTIFICATE_SMARTCONTRACT_ADDRESS env var is required");
  }
  return addr as `0x${string}`;
}

export interface DiamondInfo {
  reportNo: string;
  shape: string;
  caratWeight: string;
  colorGrade: string;
  clarityGrade: string;
  cutGrade: string;
  measurements: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
}

export interface OnChainAttachment {
  id: string;
  title: string;
  uri: string;
  description: string;
}

export interface MintParams {
  to: `0x${string}`;
  metadataURI: string;
  productName: string;
  designStory: string;
  traceId: string;
  diamond: DiamondInfo;
  photos: string[];
  videos: string[];
  attachments: OnChainAttachment[];
}

export interface MintResult {
  tokenId: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
  contractAddress: `0x${string}`;
}

export interface CreateCertificateInput {
  productName: string;
  designStory?: string;
  traceId?: string;
  diamond: DiamondInfo;
  photos: string[];
  videos: string[];
  attachments: Array<{
    id: string;
    title: string;
    fileUrl: string;
    description?: string;
  }>;
}

export interface CertificateResponse extends MintResult {
  productName: string;
  designStory: string;
  traceId: string;
  diamond: DiamondInfo;
  photoUris: string[];
  videoUris: string[];
  attachments: OnChainAttachment[];
}

export interface AddTimelineLogInput {
  description: string;
  data?: string;
  attachments: Array<{
    id: string;
    title: string;
    fileUrl: string;
    description?: string;
  }>;
}

export interface TimelineLogResponse {
  tokenId: bigint;
  logIndex: bigint;
  timestamp: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
  contractAddress: `0x${string}`;
  description: string;
  data: string;
  attachments: OnChainAttachment[];
}

export interface TimelineLogView {
  logIndex: string;
  timestamp: string;
  description: string;
  data: string;
  attachments: OnChainAttachment[];
}

export interface CertificateDetailResponse {
  tokenId: string;
  owner: `0x${string}`;
  tokenURI: string;
  productName: string;
  designStory: string;
  traceId: string;
  diamond: DiamondInfo;
  photos: string[];
  videos: string[];
  attachments: OnChainAttachment[];
  mintedAt: string;
  mintedBy: `0x${string}`;
  timeline: TimelineLogView[];
}

export default class DiamondCertificateService {
  private env: any;
  private pinata: PinataUploadService;
  private viem: ViemClient;
  private nftContract: ViemContractService;

  constructor(env: any) {
    this.env = env;
    this.pinata = new PinataUploadService(env);
    this.viem = new ViemClient(env);
    this.nftContract = new ViemContractService(this.viem, env);
  }

  private async uploadAttachmentsToPinata(
    attachments: CreateCertificateInput["attachments"]
  ): Promise<OnChainAttachment[]> {
    return Promise.all(
      attachments.map(async (att) => {
        const file = await downloadToFile(att.fileUrl, att.id);
        const uploaded = await this.pinata.uploadFile(file, {
          keyvalues: { attachmentId: att.id }
        });
        return {
          id: att.id,
          title: att.title,
          uri: uploaded.ipfsUrl,
          description: att.description ?? ""
        };
      })
    );
  }

  private buildMetadataJson(
    input: CreateCertificateInput,
    photoUris: string[],
    videoUris: string[],
    attachments: OnChainAttachment[]
  ) {
    return {
      name: input.productName,
      description: input.designStory ?? "",
      image: photoUris[0] ?? "",
      animation_url: videoUris[0] ?? "",
      external_url: "",
      attributes: [
        { trait_type: "Trace ID", value: input.traceId ?? "" },
        { trait_type: "Report No", value: input.diamond.reportNo },
        { trait_type: "Shape", value: input.diamond.shape },
        { trait_type: "Carat Weight", value: input.diamond.caratWeight },
        { trait_type: "Color", value: input.diamond.colorGrade },
        { trait_type: "Clarity", value: input.diamond.clarityGrade },
        { trait_type: "Cut", value: input.diamond.cutGrade },
        { trait_type: "Polish", value: input.diamond.polish },
        { trait_type: "Symmetry", value: input.diamond.symmetry },
        { trait_type: "Fluorescence", value: input.diamond.fluorescence }
      ],
      properties: {
        photos: photoUris,
        videos: videoUris,
        attachments: attachments.map((a) => ({
          id: a.id,
          title: a.title,
          uri: a.uri,
          description: a.description
        }))
      }
    };
  }

  async mintCertificate(params: MintParams): Promise<MintResult> {
    const { chain } = getActiveChainConfig();
    const contractAddress = getDiamondCertificateSmartContractAddress(this.env);
    const walletClient = this.viem.getWalletClient() as any;
    const publicClient = this.viem.getPublicClient();
    const account = this.viem.getAccount();
    const abi = await this.nftContract.fetchAbi(contractAddress);

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "mint",
      args: [
        params.to,
        params.metadataURI,
        params.productName,
        params.designStory,
        params.traceId,
        params.diamond,
        params.photos,
        params.videos,
        params.attachments
      ],
      account,
      chain
    });

    const txHash = await walletClient.writeContract({ ...request, chain });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const logs = await publicClient.getContractEvents({
      address: contractAddress,
      abi,
      eventName: "CertificateMinted",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    });

    const tokenId = (logs[0]?.args as { tokenId?: bigint } | undefined)?.tokenId ?? BigInt(0);

    return {
      tokenId,
      txHash,
      blockNumber: receipt.blockNumber,
      contractAddress
    };
  }

  async totalMinted(): Promise<bigint> {
    const contractAddress = getDiamondCertificateSmartContractAddress(this.env);
    const publicClient = this.viem.getPublicClient();
    const abi = await this.nftContract.fetchAbi(contractAddress);
    const result = await (publicClient.readContract as any)({
      address: contractAddress,
      abi,
      functionName: "totalMinted"
    });
    return result as bigint;
  }

  async getCertificateDetail(tokenId: bigint): Promise<CertificateDetailResponse> {
    const contractAddress = getDiamondCertificateSmartContractAddress(this.env);
    const publicClient = this.viem.getPublicClient();
    const abi = await this.nftContract.fetchAbi(contractAddress);

    const readArgs = { address: contractAddress, abi };

    const [owner, tokenURI, cert, photos, videos, attachments, timelineLogs] = await Promise.all([
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "ownerOf",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "tokenURI",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "getCertificate",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "getPhotos",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "getVideos",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "getAttachments",
        args: [tokenId]
      }),
      (publicClient.readContract as any)({
        ...readArgs,
        functionName: "getTimelineLogs",
        args: [tokenId]
      })
    ]);

    const [productName, designStory, traceId, diamond, mintedAt, mintedBy] = cert as [
      string,
      string,
      string,
      DiamondInfo,
      bigint,
      `0x${string}`
    ];

    const rawLogs = timelineLogs as Array<{
      timestamp: bigint;
      description: string;
      data: string;
      attachments: OnChainAttachment[];
    }>;
    const timeline: TimelineLogView[] = rawLogs.map((log, index) => ({
      logIndex: index.toString(),
      timestamp: log.timestamp.toString(),
      description: log.description,
      data: log.data,
      attachments: log.attachments
    }));

    return {
      tokenId: tokenId.toString(),
      owner: owner as `0x${string}`,
      tokenURI: tokenURI as string,
      productName,
      designStory,
      traceId,
      diamond,
      photos: photos as string[],
      videos: videos as string[],
      attachments: attachments as OnChainAttachment[],
      mintedAt: mintedAt.toString(),
      mintedBy,
      timeline
    };
  }

  async addTimelineLog(
    tokenId: bigint,
    input: AddTimelineLogInput
  ): Promise<TimelineLogResponse> {
    const { chain } = getActiveChainConfig();
    const contractAddress = getDiamondCertificateSmartContractAddress(this.env);
    const walletClient = this.viem.getWalletClient() as any;
    const publicClient = this.viem.getPublicClient();
    const account = this.viem.getAccount();
    const abi = await this.nftContract.fetchAbi(contractAddress);

    const onChainAttachments = await this.uploadAttachmentsToPinata(input.attachments);

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "addTimelineLog",
      args: [tokenId, input.description, input.data ?? "", onChainAttachments],
      account,
      chain
    });

    const txHash = await walletClient.writeContract({ ...request, chain });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const logs = await publicClient.getContractEvents({
      address: contractAddress,
      abi,
      eventName: "TimelineLogAdded",
      args: { tokenId },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    });

    const args = logs[0]?.args as
      | { logIndex?: bigint; timestamp?: bigint }
      | undefined;

    return {
      tokenId,
      logIndex: args?.logIndex ?? BigInt(0),
      timestamp: args?.timestamp ?? BigInt(0),
      txHash,
      blockNumber: receipt.blockNumber,
      contractAddress,
      description: input.description,
      data: input.data ?? "",
      attachments: onChainAttachments
    };
  }

  async createCertificate(input: CreateCertificateInput): Promise<CertificateResponse> {
    const photoUris = await this.pinata.uploadFromUrls(input.photos, {
      keyvalues: { kind: "diamond-cert-photo" }
    });
    const videoUris = await this.pinata.uploadFromUrls(input.videos, {
      keyvalues: { kind: "diamond-cert-video" }
    });
    const onChainAttachments = await this.uploadAttachmentsToPinata(input.attachments);

    const metadataJson = this.buildMetadataJson(input, photoUris, videoUris, onChainAttachments);
    const metadataUploaded = await this.pinata.uploadJson(metadataJson, {
      name: `diamond-certificate-${input.diamond.reportNo}.json`,
      keyvalues: { kind: "diamond-cert-metadata", reportNo: input.diamond.reportNo }
    });
    const metadataURI = metadataUploaded.ipfsUrl;

    const systemWallet = this.viem.getAccount().address;
    const mintResult = await this.mintCertificate({
      to: systemWallet,
      metadataURI,
      productName: input.productName,
      designStory: input.designStory ?? "",
      traceId: input.traceId ?? "",
      diamond: input.diamond,
      photos: photoUris,
      videos: videoUris,
      attachments: onChainAttachments
    });

    return {
      ...mintResult,
      productName: input.productName,
      designStory: input.designStory ?? "",
      traceId: input.traceId ?? "",
      diamond: input.diamond,
      photoUris,
      videoUris,
      attachments: onChainAttachments
    };
  }
}
