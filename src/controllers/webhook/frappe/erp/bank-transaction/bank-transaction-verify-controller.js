import ERP from "services/erp";

export default class BankTransactionVerifyController {
  static async create(ctx) {
    const payload = await ctx.req.json();
    const service = new ERP.Accounting.BankTransactionVerificationService(ctx.env);
    const result = await service.verifyAndUpdatePaymentEntry(payload);

    if (!result.success) {
      return ctx.json(result, result.statusCode);
    }

    return ctx.json(result, 200);
  }
}
