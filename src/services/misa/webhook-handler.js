import * as Sentry from "@sentry/cloudflare";
import MisaCallbackVoucherHandler from "services/misa/callback-voucher-handler";
import { CALLBACK_TYPE } from "services/misa/constant";
import Misa from "services/misa";

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
   * @param {object} body - The full webhook payload from MISA or internal job payload.
   */
  async handleWebhook(body) {
    if (body?.job_type) {
      return await this._handleInternalJob(body);
    }

    if (body.app_id !== this.env.MISA_APP_ID || body.org_company_code !== this.env.MISA_ORG_CODE) {
      Sentry.captureMessage(`MISA Webhook: app_id = ${body.app_id} or org_company_code = ${body.org_company_code} mismatch. Ignoring.`);
      return;
    }

    const dataPayload = JSON.parse(body.data);
    if (body.data_type === CALLBACK_TYPE.SAVE_FUNCTION && dataPayload[0]?.voucher_type) {
      await this.voucherHandler.process(dataPayload);
    }
  }

  /**
   * Handle internal job requests (create vouchers, etc.)
   * @private
   */
  async _handleInternalJob(body) {
    const { job_type, data } = body;

    switch (job_type) {
    case "create_qr_voucher":
      await this._createQrVoucher(data.qr_transaction_id);
      break;
    default:
      break;
    }
  }

  /**
   * Create MISA voucher Job
   * @private
   */
  async _createQrVoucher(id) {
    const service = new Misa.QrTransactionService(this.env);
    const qrTransaction = await service.findQrRecordByGuid(id);
    if (!qrTransaction) {
      Sentry.captureMessage(`MISA: QR Payment record not found for ID: ${id}`);
      return;
    }

    await service.processTransaction(qrTransaction);
  }
}
