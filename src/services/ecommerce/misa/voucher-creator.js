import dayjs from "dayjs";
import Database from "services/database";
import QrPaymentFetchingService from "services/ecommerce/qr_payment/fetch-service";
import ManualPaymentFetchingService from "services/ecommerce/manual_payment/fetch-service";
import CashVoucherMappingService from "services/misa/mapping/cash-voucher-mapping-service";
import MisaClient from "services/clients/misa-client";
import VoucherMappingService from "services/misa/mapping/voucher-mapping-service";
import { PAYMENT_TYPES, VOUCHER_MODEL, VOUCHER_REF_TYPES, VOUCHER_TYPES } from "services/misa/constant";

export default class MisaVoucherCreator {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.qrPaymentFetcher = new QrPaymentFetchingService(env);
    this.manualPaymentFetcher = new ManualPaymentFetchingService(env);
  }

  /**
   * Kicks off voucher creation for the morning batch.
   * (Yesterday 18:00 to Today 08:30)
   */
  async runMorningBatch() {
    const now = dayjs().utc();
    const startDate = now.subtract(1, "day").hour(18).minute(0).second(0).subtract(7, "hour");
    const endDate = now.hour(8).minute(30).second(0).subtract(7, "hour");
    await this._createVouchersForDateRange(startDate.toDate(), endDate.toDate());
  }

  /**
   * Kicks off voucher creation for the afternoon batch.
   * (Today 08:30 to Today 13:30)
   */
  async runAfternoonBatch() {
    const now = dayjs().utc();
    const startDate = now.hour(8).minute(30).second(0).subtract(7, "hour");
    const endDate = now.hour(13).minute(30).second(0).subtract(7, "hour");
    await this._createVouchersForDateRange(startDate.toDate(), endDate.toDate());
  }

  /**
   * Kicks off voucher creation for the end-of-day batch.
   * (Today 13:30 to Today 18:00)
   */
  async runEndOfDayBatch() {
    const now = dayjs().utc();
    const startDate = now.hour(13).minute(30).second(0).subtract(7, "hour");
    const endDate = now.hour(18).minute(0).second(0).subtract(7, "hour");
    await this._createVouchersForDateRange(startDate.toDate(), endDate.toDate());
  }

  /**
   * Manages the processes of creating vouchers.
   * @private
   */
  async _createVouchersForDateRange(startDate, endDate) {
    // Initialize MISA client
    const misaClient = new MisaClient(this.env);
    await misaClient.getAccessToken();

    // Pre-fetch bank dictionary of our company
    // TO-DO: Cache this
    const bankDictionary = await misaClient.getDictionary(8, 0, MisaClient.RETRIEVABLE_LIMIT, null);
    const bankMap = bankDictionary.reduce((map, bank) => {
      map[bank.bank_account_number] = { bank_name: bank.bank_name, bank_branch_name: bank.bank_branch_name };
      return map;
    }, {});

    const [qrResults, manualResults, codResults] = await Promise.all([
      this._processPaymentType({
        paymentTypeName: PAYMENT_TYPES.QR_PAYMENT,
        fetcher: this.qrPaymentFetcher,
        mapper: VoucherMappingService.transformQrToVoucher,
        dateRange: { startDate, endDate },
        misaClient,
        bankMap
      }),
      this._processPaymentType({
        paymentTypeName: PAYMENT_TYPES.MANUAL_PAYMENT,
        fetcher: this.manualPaymentFetcher,
        mapper: CashVoucherMappingService.transforManualToVoucher,
        dateRange: { startDate, endDate },
        misaClient,
        bankMap
      }),
      this._processPaymentType({
        paymentTypeName: PAYMENT_TYPES.OTHER_MANUAL_PAYMENT,
        fetcher: this.manualPaymentFetcher,
        mapper: CashVoucherMappingService.transforManualToVoucher,
        dateRange: { startDate, endDate },
        misaClient,
        bankMap
      })
    ]);

    return { qrResults, manualResults, codResults };
  }

  /**
   * Handles the entire workflow for a single payment type.
   * @private
   */
  async _processPaymentType({ paymentTypeName, fetcher, mapper, dateRange, misaClient, bankMap }) {
    try {
      let payments = [];
      if (paymentTypeName === PAYMENT_TYPES.OTHER_MANUAL_PAYMENT) {
        payments =  await fetcher.fetchNonCashByDateRange(dateRange.startDate, dateRange.endDate);
      } else {
        payments = await fetcher.byDateRangeAndNotSynced(dateRange.startDate, dateRange.endDate);
      }

      if (!payments || payments.length === 0) {
        return { status: "skipped", count: 0 };
      }

      const mappedVouchers = payments.map(p => {
        const voucher_type = VOUCHER_TYPES[paymentTypeName];
        const ref_type = VOUCHER_REF_TYPES[paymentTypeName];

        return mapper(p, bankMap, voucher_type, ref_type);
      });

      const vouchersForMisa = mappedVouchers.map(v => v.misaVoucher);

      const payload = {
        app_id: this.env.MISA_APP_ID,
        org_company_code: this.env.MISA_ORG_CODE,
        voucher: vouchersForMisa
      };

      const response = await misaClient.saveVoucher(payload);

      if(response.Success === true){
        const updateOperations = mappedVouchers.map(item => {
          const modelName = VOUCHER_MODEL[paymentTypeName];
          const whereClause  = paymentTypeName === PAYMENT_TYPES.QR_PAYMENT ? { id: item.originalId } : { uuid: item.originalId };
          return this.db[modelName].update({
            where: whereClause,
            data: { misa_sync_guid: item.generatedGuid }
          });
        });
        await this.db.$transaction(updateOperations);
        return { status: "success", count: payments.length, message: response.Data };
      }
      return { status: "error", message: response.ErrorMessage };
    } catch (error) {
      console.error(`Error processing ${paymentTypeName}:`, error);
      return { status: "error", message: error.message };
    }
  }
}
