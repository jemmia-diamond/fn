import ERP from "services/erp";

export default class BankTransactionController {
  static async create(ctx) {
    const payload = await ctx.req.json();
    const { action, bank_transaction } = payload;

    if (action === "verify") {
      const service = new ERP.Accounting.BankTransactionVerificationService(ctx.env);
      const result = await service.verifyAndUpdatePaymentEntry(bank_transaction);

      if (!result.success) {
        return ctx.json(result, result.statusCode);
      }

      return ctx.json(result, 200);
    }

    return ctx.json({ message: "Action not supported", success: false }, 400);
  }
}
