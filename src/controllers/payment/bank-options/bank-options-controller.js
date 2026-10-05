import PaymentService from "services/payment";

export default class BankOptionsController {
  static async index(c) {
    const bankOptionsService = new PaymentService.BankOptionsService(c.env);
    const bankOptions = await bankOptionsService.fetchBankOptions();
    return c.json(bankOptions);
  }
}
