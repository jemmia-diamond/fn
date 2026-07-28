import { createAxiosClient } from "services/utils/http-client";

export default class BankOptionsService {
  constructor(env) {
    this.env = env;
  }

  async fetchBankOptions() {
    const token = this.env.SEPAY_API_TOKEN;
    const client = createAxiosClient({
      baseURL: "https://my.sepay.vn/userapi/bankaccounts/list",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const response = await client.get("");
    const data = response.data;

    if (data && data.bankaccounts) {
      return data.bankaccounts.map(account => ({
        bank: account.bank_full_name,
        bankCode: account.bank_code,
        bankAccountNumber: account.account_number,
        bankName: account.account_holder_name,
        bankBin: account.bank_bin
      }));
    }

    return [];
  }
}
