import * as Sentry from "@sentry/cloudflare";
import Misa from "services/misa";

const ONE_MINUTE_DELAY = 60;

export default class CallbackResultsController {
  static async create(ctx) {
    try {
      const payload = await ctx.req.json();
      if (payload.data_type === Misa.Constants.CALLBACK_TYPE.SAVE_FUNCTION) {
        await ctx.env["MISA_QUEUE"].send(payload, { delaySeconds: ONE_MINUTE_DELAY });
      }

      return ctx.json({ message: "Message receive", status: 200 });
    } catch (e) {
      Sentry.captureException(e);
      return ctx.json({ message: "Internal server error", status: 500 });
    };
  };
};
