import Misa from "services/misa";

const ONE_MINUTE_DELAY = 60;
const THIRD_PARTY_TEAM_WEBHOOK = "https://amis.hrvapps.com/hook/amis";

export default class CallbackResultsController {
  static async create(ctx) {
    const payload = await ctx.req.json();
    const firstVoucher = JSON.parse(payload.data)[0];

    const isSaveFunction = payload.data_type === Misa.Constants.CALLBACK_TYPE.SAVE_FUNCTION;
    const isPaymentVoucher = [
      Misa.Constants.VOUCHER_TYPES.MANUAL_PAYMENT, Misa.Constants.VOUCHER_TYPES.QR_PAYMENT
    ].includes(firstVoucher.voucher_type);

    if (isSaveFunction && isPaymentVoucher) {
      await ctx.env["MISA_QUEUE"].send(payload, { delaySeconds: ONE_MINUTE_DELAY });
    } else {
      fetch(THIRD_PARTY_TEAM_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    return ctx.json({ message: "Message receive", status: 200 });
  };
};
