import * as Sentry from "@sentry/cloudflare";
import * as crypto from "crypto";
import Database from "services/database";
import MisaClient from "services/clients/misa-client";
import VoucherMappingService from "services/misa/mapping/voucher-mapping-service";
import { VOUCHER_TYPES, VOUCHER_REF_TYPES, buildOrgUnitMap } from "services/misa/constant";
import Misa from "services/misa";
import Payment from "services/payment";
import dayjs from "dayjs";

export default class QrTransactionService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async processTransaction(qrTransaction) {
    if (qrTransaction.misa_sync_guid && qrTransaction.misa_synced_at) {
      return true;
    }

    const currentTime = dayjs().utc().toDate();
    const generatedGuid = crypto.randomUUID();

    const claimed = await this.db.qrPaymentTransaction.updateMany({
      where: {
        id: qrTransaction.id,
        misa_sync_guid: null
      },
      data: {
        misa_sync_guid: generatedGuid
      }
    });

    if (claimed.count === 0) {
      return true;
    }

    try {
      const misaClient = new MisaClient(this.env);
      await misaClient.getAccessToken();

      const bankDictionary = await misaClient.getDictionary(8, 0, MisaClient.RETRIEVABLE_LIMIT, null);
      const bankMap = bankDictionary.reduce((map, bank) => {
        map[bank.bank_account_number] = {
          bank_name: bank.bank_name,
          bank_branch_name: bank.bank_branch_name
        };
        return map;
      }, {});

      const orgUnitDictionary = await misaClient.getDictionary(6, 0, MisaClient.RETRIEVABLE_LIMIT, null);
      const orgUnitMap = buildOrgUnitMap(orgUnitDictionary);

      const journalNote = qrTransaction.payment_references.length > 1
        ? this._multiOrderName(qrTransaction.payment_references)
        : await Misa.Utils.getJournalNote(this.db, qrTransaction);

      const { misaVoucher, originalId } = await VoucherMappingService.transformQrToVoucher(
        qrTransaction,
        bankMap,
        orgUnitMap,
        VOUCHER_TYPES.QR_PAYMENT,
        VOUCHER_REF_TYPES.QR_PAYMENT,
        journalNote,
        this.env,
        generatedGuid,
        this.db
      );

      const payload = {
        app_id: this.env.MISA_APP_ID,
        org_company_code: this.env.MISA_ORG_CODE,
        voucher: [misaVoucher]
      };

      const response = await misaClient.saveVoucher(payload);

      if (response.Success === true) {
        await this.db.qrPaymentTransaction.update({
          where: { id: originalId },
          data: {
            misa_synced_at: currentTime
          }
        });

        return true;
      } else {
        await this.db.qrPaymentTransaction.update({
          where: { id: originalId },
          data: {
            misa_sync_guid: null
          }
        });

        const errorMsg = {
          order_number: qrTransaction.haravan_order_number,
          qr_id: qrTransaction.id,
          misa_response: response?.ErrorMessage
        };

        Sentry.captureMessage(
          `MISA QR Transaction sync failed for order ${qrTransaction.haravan_order_number}`,
          { level: "error", extra: errorMsg }
        );
      }
    } catch (error) {
      await this.db.qrPaymentTransaction.update({
        where: { id: qrTransaction.id },
        data: {
          misa_sync_guid: null
        }
      }).catch(() => {});
      throw error;
    }
  }

  async findQrRecordByGuid(id) {
    const fetchService = new Payment.QrPaymentFetchingService(this.env);
    return this.db.qrPaymentTransaction.findUnique({
      where: {
        id,
        is_deleted: false
      },
      select: fetchService.misaRequiredFields()
    });
  }

  _multiOrderName(references) {
    return references.map(item => item?.order_number).join(", ");
  }
}
