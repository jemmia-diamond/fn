import type { Abi } from "viem";
import { getActiveChainConfig } from "services/clients/viem-client.js";
import ViemClient from "services/clients/viem-client.js";

interface ExplorerAbiResponse {
  status: string;
  message: string;
  result: string;
}

export class ViemContractService {
  private viem: ViemClient;
  private env: any;
  private abiCache: Map<string, Abi> = new Map();

  constructor(viem: ViemClient, env: any) {
    this.viem = viem;
    this.env = env;
  }

  async deployContract(params: {
    abi: Abi;
    bytecode: `0x${string}`;
    args?: unknown[];
  }) {
    const { chain } = getActiveChainConfig();
    const walletClient = this.viem.getWalletClient() as any;
    const publicClient = this.viem.getPublicClient();

    const hash = await walletClient.deployContract({
      ...params,
      chain
    });
    return publicClient.waitForTransactionReceipt({ hash });
  }

  async fetchAbi(contractAddress: `0x${string}`): Promise<Abi> {
    const cached = this.abiCache.get(contractAddress);
    if (cached) return cached;

    const { chain, explorerApiUrl, explorerApiKeyEnvVar } = getActiveChainConfig();
    const apiKey = await this.getExplorerApiKey(explorerApiKeyEnvVar);

    const url = new URL(explorerApiUrl);
    url.searchParams.set("module", "contract");
    url.searchParams.set("action", "getabi");
    url.searchParams.set("address", contractAddress);
    url.searchParams.set("chainid", String(chain.id));
    if (apiKey) {
      url.searchParams.set("apikey", apiKey);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ABI for ${contractAddress}: HTTP ${response.status}`
      );
    }

    const data = (await response.json()) as ExplorerAbiResponse;
    if (data.status !== "1") {
      throw new Error(
        `Failed to fetch ABI for ${contractAddress}: ${data.message} - ${data.result}`
      );
    }

    const abi = JSON.parse(data.result) as Abi;
    this.abiCache.set(contractAddress, abi);
    return abi;
  }

  private async getExplorerApiKey(envVarName: string): Promise<string | undefined> {
    const value = this.env[envVarName];
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object" && typeof value.get === "function") {
      return (await value.get()) as string;
    }
    return undefined;
  }
}

export default ViemContractService;
