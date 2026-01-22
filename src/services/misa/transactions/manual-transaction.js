import * as Sentry from "@sentry/cloudflare";
import * as crypto from "crypto";
import Database from "services/database";
import MisaClient from "services/clients/misa-client";
import CashVoucherMappingService from "services/misa/mapping/cash-voucher-mapping-service";
import { VOUCHER_TYPES, VOUCHER_REF_TYPES, buildOrgUnitMap } from "services/misa/constant";
import Misa from "services/misa";
import Payment from "services/payment";
import dayjs from "dayjs";

export default class ManualTransactionService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async processTransaction(manualPayment) {
    if (manualPayment.misa_sync_guid && manualPayment.misa_synced_at) {
      return true;
    }

    const currentTime = dayjs().utc().toDate();
    const generatedGuid = crypto.randomUUID();

    const claimed = await this.db.manualPaymentTransaction.updateMany({
      where: {
        uuid: manualPayment.uuid,
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

      const journalNote = manualPayment.payment_references.length > 1
        ? this._multiOrderName(manualPayment.payment_references)
        : await Misa.Utils.getJournalNote(this.db, manualPayment);
      const isCash = manualPayment.payment_type === "Tiền Mặt";
      const voucherType = isCash ? VOUCHER_TYPES.MANUAL_PAYMENT : VOUCHER_TYPES.OTHER_MANUAL_PAYMENT;
      const refType = isCash ? VOUCHER_REF_TYPES.MANUAL_PAYMENT : VOUCHER_REF_TYPES.OTHER_MANUAL_PAYMENT;

      const { misaVoucher, originalId } = await CashVoucherMappingService.transforManualToVoucher(
        manualPayment,
        bankMap,
        orgUnitMap,
        voucherType,
        refType,
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
        await this.db.manualPaymentTransaction.update({
          where: { uuid: originalId },
          data: {
            misa_synced_at: currentTime
          }
        });

        return true;
      } else {
        await this.db.manualPaymentTransaction.update({
          where: { uuid: originalId },
          data: {
            misa_sync_guid: null
          }
        });

        const errorMsg = {
          order_number: manualPayment.haravan_order_name,
          manual_payment_uuid: manualPayment.uuid,
          misa_response: response?.ErrorMessage
        };

        Sentry.captureMessage(
          `MISA Manual Payment sync failed for order ${manualPayment.haravan_order_name}`,
          { level: "error", extra: errorMsg }
        );
      }
    } catch (error) {
      await this.db.manualPaymentTransaction.update({
        where: { uuid: manualPayment.uuid },
        data: {
          misa_sync_guid: null
        }
      }).catch(() => {});
      throw error;
    }
  }

  async findManualPaymentByUuid(uuid) {
    const fetchService = new Payment.ManualPaymentFetchingService(this.env);
    return this.db.manualPaymentTransaction.findUnique({
      where: {
        uuid
      },
      select: fetchService.misaRequiredFields()
    });
  }

  _multiOrderName(references) {
    return references.map(item => item?.order_number).join(", ");
  }
}
