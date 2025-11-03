import * as Sentry from "@sentry/cloudflare";
import MisaCallbackVoucherHandler from "services/misa/callback-voucher-handler";
import { CALLBACK_TYPE } from "services/misa/constant";

export default class MisaWebhookHandler {
  constructor(env) {
    this.env = env;
    this.voucherHandler = new MisaCallbackVoucherHandler(env);
  }

  async dequeueCallbackPayloadQueue(batch) {
    const messages = batch.messages;

    for (const message of messages) {
      const body = message.body;

      await this.handleWebhook(body).catch(err =>
        Sentry.captureException(err)
      );
    }
  }

  /**
   * Main webhook router. Validates incoming MISA webhooks and delegates to specialized handlers.
   * @param {object} body - The full webhook payload from MISA.
   */
  async handleWebhook(body) {
    if (body.app_id !== this.env.MISA_APP_ID || body.org_company_code !== this.env.MISA_ORG_CODE) {
      Sentry.captureMessage(`MISA Webhook: app_id = ${body.app_id} or org_company_code = ${body.org_company_code} mismatch. Ignoring.`);
      return;
    }

    const dataPayload = JSON.parse(body.data);
    if (body.data_type === CALLBACK_TYPE.SAVE_FUNCTION && dataPayload[0]?.voucher_type) {
      await this.voucherHandler.process(dataPayload);
    }
  }
}
