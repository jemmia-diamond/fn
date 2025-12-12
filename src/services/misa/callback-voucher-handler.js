import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import { VOUCHER_TYPES } from "services/misa/constant";

export default class MisaCallbackVoucherHandler {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.doctype = "Payment Entry";
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

        const record = await this.db[modelName].findFirst({
          where: { misa_sync_guid: org_refid },
          select: {
            payment_entry_name: true,
            misa_synced_at: true
          }
        });

        if (record?.payment_entry_name) {
          await this.frappeClient.update({
            doctype: this.doctype,
            name: record.payment_entry_name,
            misa_sync_error_msg: record.misa_sync_error_msg,
            misa_synced: record.misa_synced,
            misa_synced_at: record.misa_synced_at,
            misa_sync_guid: org_refid
          }, "name");
        }

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
