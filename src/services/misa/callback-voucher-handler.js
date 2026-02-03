import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import { VOUCHER_TYPES } from "services/misa/constant";
import dayjs from "dayjs";

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
    this.featureOwnerInChare = "binh.le@jemmia.vn";
  }

  /**
   * @param {Array} results - The parsed array of voucher result objects from the MISA webhook.
   * @param {Object} outerPayload - The outer webhook payload containing top-level success/error info
   */
  async process(results, outerPayload = {}) {
    const modelName = await this._determineModelName(results[0]);

    if (!modelName) {
      Sentry.captureMessage("MISA Callback: Could not determine model for batch. Skipping.", results[0]);
      return;
    }

    const outerFailed = outerPayload?.success === false;
    for (const result of results) {
      const { org_refid, success, error_message, error_code = "" } = result;

      try {
        const actualSuccess = outerFailed ? false : success;
        const actualErrorCode = outerFailed ? (outerPayload?.error_code || error_code || "No error code") : error_code;
        const actualErrorMessage = outerFailed
          ? (outerPayload?.error_message || error_message || "No failed message") : error_message;
        const formattedError = actualErrorCode && actualErrorMessage
          ? `[${actualErrorCode}] ${actualErrorMessage}` : actualErrorMessage;

        const dataToUpdate = {
          misa_synced: actualSuccess,
          misa_sync_error_msg: actualSuccess ? null : formattedError || null
        };

        await this.db[modelName].updateMany({
          where: { misa_sync_guid: org_refid },
          data: dataToUpdate
        });

        const record = await this.db[modelName].findFirst({
          where: { misa_sync_guid: org_refid }
        });

        if (outerFailed) {
          const error = new Error(`MISA sync failed: [${actualErrorCode}] ${actualErrorMessage}`);
          error.isMisaError = true;
          error.org_refid = org_refid;
          error.error_code = actualErrorCode;
          error.error_message = actualErrorMessage;
          error.payment_entry_name = record?.payment_entry_name;
          error.modelName = modelName;
          throw error;
        }

        if (record?.payment_entry_name) {
          await this.frappeClient.update({
            doctype: this.doctype,
            name: record.payment_entry_name,
            misa_sync_error_msg: record.misa_sync_error_msg,
            misa_synced: record.misa_synced,
            misa_synced_at: record.misa_synced_at ? dayjs(record.misa_synced_at).format("YYYY-MM-DD HH:mm:ss") : null,
            misa_sync_guid: org_refid
          }, "name");
        }

      } catch (error) {
        if (error?.isMisaError && error?.payment_entry_name) {
          await this.frappeClient.createComment({
            referenceDoctype: this.doctype,
            referenceName: error.payment_entry_name,
            content: `MISA trả kết quả: [${error?.error_code}] ${error?.error_message}`,
            mentionPerson: this.featureOwnerInChare
          }).catch(() => {});
          if (error?.error_code == "Exception") {
            await this.db[error.modelName].updateMany({
              where: { misa_sync_guid: error.org_refid },
              data: {
                misa_sync_guid: null,
                misa_synced_at: null
              }
            });
          }
        }

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
