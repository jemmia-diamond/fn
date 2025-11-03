import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import { VOUCHER_TYPES } from "services/misa/constant";

export default class MisaCallbackVoucherHandler {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * @param {Array} results - The parsed array of voucher result objects from the MISA webhook.
   */
  async process(results) {
    const modelName = await this._determineModelName(results[0]);

    if (!modelName) {
      Sentry.captureMessage("MISA Callback: Could not determine model for batch. Skipping.", results[0]);
      return;
    }

    for (const result of results) {
      const { org_refid, success, error_message } = result;

      try {
        const dataToUpdate = {
          misa_synced: success,
          misa_sync_error_msg: success ? null : error_message
        };

        await this.db[modelName].updateMany({
          where: { misa_sync_guid: org_refid },
          data: dataToUpdate
        });

      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Determines which database model to use based on the first result in a webhook payload data.
   * @private
   */
  async _determineModelName(firstResult) {
    const { voucher_type, org_refid } = firstResult;

    if (voucher_type === VOUCHER_TYPES.MANUAL_PAYMENT) {
      return "manualPaymentTransaction";
    }

    if (voucher_type === VOUCHER_TYPES.QR_PAYMENT) {
      if (!org_refid) return null;

      const qrRecord = await this.db.qrPaymentTransaction.findFirst({
        where: { misa_sync_guid: org_refid },
        select: { id: true }
      });

      return qrRecord ? "qrPaymentTransaction" : "manualPaymentTransaction";
    }

    return null;
  }
}
