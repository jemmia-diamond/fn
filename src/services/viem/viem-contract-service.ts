import type { Abi } from "viem";
import { getActiveChainConfig } from "services/clients/viem-client.js";
import ViemClient from "services/clients/viem-client.js";

export class ViemContractService {
  private viem: ViemClient;

  constructor(viem: ViemClient) {
    this.viem = viem;
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
}

export default ViemContractService;
