import ManualPaymentService from "services/payment/manual-pay/payment";
import QrPaymentFetchingService from "services/payment/qr_payment/fetch-service";
import ManualPaymentFetchingService from "services/payment/manual-pay/fetch-service";
import MisaVoucherSyncService from "services/payment/misa/voucher-sync-service";
import CreateQRService from "services/payment/qr_payment/create-qr-service";
import FindQRService from "services/payment/qr_payment/find-qr-service";
import MapQRWithBankTransactionService from "services/payment/qr_payment/map-qr-with-bank-transaction-service";
import LinkQRWithRealOrderService from "services/payment/qr_payment/link-qr-with-real-order-service";

export default {
  ManualPaymentService: ManualPaymentService,
  QrPaymentFetchingService,
  ManualPaymentFetchingService,
  MisaVoucherSyncService,
  CreateQRService: CreateQRService,
  FindQRService: FindQRService,
  MapQRWithBankTransactionService: MapQRWithBankTransactionService,
  LinkQRWithRealOrderService: LinkQRWithRealOrderService
};
