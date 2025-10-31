import Database from "services/database";
import { VOUCHER_TYPES } from "services/misa/constant";

export default class MisaWebhookHandler {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async handleWebhook(body) {
    const dataPayload = JSON.parse(body.data);
    if (!Array.isArray(dataPayload) || dataPayload.length === 0) {
      console.error("Invalid or empty MISA webhook dataPayload.");
      return;
    }

    const modelName = await this._determineModelName(dataPayload[0]);

    if (!modelName) {
      throw new Error("Could not determine model for webhook batch. First item:", dataPayload[0]);
    }

    for (const result of dataPayload) {
      const { org_refid, success, error_message } = result;

      if (!org_refid) {
        console.warn("Webhook result item missing org_refid. Skipping.", result);
        continue;
      }

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
        throw new Error(`Failed to update database for ${modelName} with GUID ${org_refid}. Error:`, error);
      }
    }
  }

  /**
   * Determines which database model to use based on the first result in a webhook payload data.
   *
   * @private
   * @param {object} firstResult - The first object from the MISA webhook data array.
   * @returns {string|null} The name of the Prisma model or null if indeterminate.
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
