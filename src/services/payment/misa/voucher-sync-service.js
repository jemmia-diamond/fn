import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import Database from "services/database";
import QrPaymentFetchingService from "services/payment/qr_payment/fetch-service";
import ManualPaymentFetchingService from "services/payment/manual-pay/fetch-service";
import CashVoucherMappingService from "services/misa/mapping/cash-voucher-mapping-service";
import MisaClient from "services/clients/misa-client";
import VoucherMappingService from "services/misa/mapping/voucher-mapping-service";
import { PAYMENT_TYPES, VOUCHER_MODEL, VOUCHER_REF_TYPES, VOUCHER_TYPES } from "services/misa/constant";
import { getRefOrderChains } from "services/ecommerce/order-tracking/queries/get-initial-order";

export default class MisaVoucherSyncService {
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
    const startDate = now.subtract(1, "day").hour(11).minute(0).second(0);
    const endDate = now.hour(1).minute(30).second(0);
    await this._createVouchersForDateRange(startDate.toDate(), endDate.toDate());
  }

  /**
   * Kicks off voucher creation for the afternoon batch.
   * (Today 08:30 to Today 13:30)
   */
  async runAfternoonBatch() {
    const now = dayjs().utc();
    const startDate = now.hour(1).minute(30).second(0);
    const endDate = now.hour(6).minute(30).second(0);
    await this._createVouchersForDateRange(startDate.toDate(), endDate.toDate());
  }

  /**
   * Kicks off voucher creation for the end-of-day batch.
   * (Today 13:30 to Today 18:00)
   */
  async runEndOfDayBatch() {
    const now = dayjs().utc();
    const startDate = now.hour(6).minute(30).second(0);
    const endDate = now.hour(11).minute(0).second(0);
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
    let payments = paymentTypeName === PAYMENT_TYPES.OTHER_MANUAL_PAYMENT ?
      await fetcher.fetchNonCashByDateRange(dateRange.startDate, dateRange.endDate) :
      await fetcher.byDateRangeAndNotSynced(dateRange.startDate, dateRange.endDate);

    if (!payments || payments.length === 0) {
      return { status: "skipped", count: 0 };
    }

    const paymentsWithRefOrder = payments.filter(p => p.haravan_order?.ref_order_id);
    const orderIdsToFetch = paymentsWithRefOrder.map(p => p.haravan_order_id);
    const allOrderChains = await this._fetchOrderChains(this.db, orderIdsToFetch);
    const mappedVouchers = payments.map(p => {
      const voucher_type = VOUCHER_TYPES[paymentTypeName];
      const ref_type = VOUCHER_REF_TYPES[paymentTypeName];

      let journal_note = p.haravan_order?.order_number || p.haravan_order_name;
      const orderChain = allOrderChains[p.haravan_order_id];
      if (orderChain && orderChain.length > 0) {
        const lastOrder = orderChain[orderChain.length - 1];
        let final_note = lastOrder.order_number;

        const previousOrders = orderChain.slice(0, -1);
        const firstPaidCanceledOrder = previousOrders.find(order =>
          (order.financial_status === "paid" || order.financial_status === "partially_paid") &&
          order.order_processing_status === "cancel"
        );

        if (firstPaidCanceledOrder) {
          final_note = `${lastOrder.order_number} (${firstPaidCanceledOrder.order_number})`;
        }

        journal_note = final_note;
      }

      return mapper(p, bankMap, voucher_type, ref_type, journal_note);
    });

    const vouchersForMisa = mappedVouchers.map(v => v.misaVoucher);

    const payload = {
      app_id: this.env.MISA_APP_ID,
      org_company_code: this.env.MISA_ORG_CODE,
      voucher: vouchersForMisa
    };

    const response = await misaClient.saveVoucher(payload);

    if (response.Success === true) {
      const updateOperations = mappedVouchers.map(item => {
        const modelName = VOUCHER_MODEL[paymentTypeName];
        const whereClause = paymentTypeName === PAYMENT_TYPES.QR_PAYMENT ? { id: item.originalId } : { uuid: item.originalId };
        const currentTime = dayjs().utc().toDate();
        return this.db[modelName].update({
          where: whereClause,
          data: { misa_sync_guid: item.generatedGuid, misa_synced_at: currentTime }
        });
      });
      await this.db.$transaction(updateOperations);
      return;
    } else {
      const orderNumbers = payments.map(p => p?.haravan_order_number || p?.haravan_order_name);
      const err_msg = {
        order_numbers: orderNumbers,
        found: `Found ${payments.length} ${paymentTypeName} payments for date range ${dateRange.startDate} to ${dateRange.endDate}`,
        misa_response: response?.ErrorMessage
      };

      Sentry.captureMessage(`MISA Voucher Auto sync failed for ${paymentTypeName} at ${dateRange.endDate}`,
        { level: "error", extra: err_msg });
    }
  }

  async _fetchOrderChains(db, orderIds, includeSelf = true) {
    const flatResults = await getRefOrderChains(db, orderIds, includeSelf);
    const chains = flatResults.reduce((acc, order) => {
      const { root_id, ...rest } = order;
      if (!acc[root_id]) {
        acc[root_id] = [];
      }

      if (includeSelf || root_id !== order.id) {
        acc[root_id].push(rest);
      }
      return acc;
    }, {});

    for (const key in chains) {
      if (chains[key].length === 0) {
        delete chains[key];
      }
    }
    return chains;
  }
}
