import { bsc } from "viem/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const CHAINS = {
  bsc: {
    chain: bsc,
    rpcUrl: "https://bsc-dataseed.binance.org/"
  }
} as const;

export type ChainKey = keyof typeof CHAINS;

export const ACTIVE_CHAIN_KEY: ChainKey = "bsc";

export function getActiveChainConfig() {
  return CHAINS[ACTIVE_CHAIN_KEY];
}

export function getChainConfig(key: ChainKey) {
  return CHAINS[key];
}

export class ViemClient {
  private env: any;
  private _publicClient: ReturnType<typeof createPublicClient> | null = null;
  private _walletClient: ReturnType<typeof createWalletClient> | null = null;

  constructor(env: any) {
    this.env = env;
  }

  private getPrivateKey(): `0x${string}` {
    const key = this.env.WALLET_PRIVATE_KEY;
    if (!key) {
      throw new Error("ViemClient: WALLET_PRIVATE_KEY env var is required");
    }
    return key.startsWith("0x") ? key : `0x${key}`;
  }

  private getRpcUrl(): string {
    return getActiveChainConfig().rpcUrl;
  }

  getPublicClient() {
    if (!this._publicClient) {
      const { chain } = getActiveChainConfig();
      this._publicClient = createPublicClient({
        chain,
        transport: http(this.getRpcUrl())
      });
    }
    return this._publicClient;
  }

  getWalletClient() {
    if (!this._walletClient) {
      const { chain } = getActiveChainConfig();
      const account = privateKeyToAccount(this.getPrivateKey());
      this._walletClient = createWalletClient({
        account,
        chain,
        transport: http(this.getRpcUrl())
      });
    }
    return this._walletClient;
  }

  getAccount() {
    return privateKeyToAccount(this.getPrivateKey());
  }
}

export default ViemClient;
