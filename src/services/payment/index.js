import ManualPaymentFetchingService from "services/payment/manual-pay/fetch-service";
import MisaVoucherCreator from "services/payment/misa/voucher-creator";
import QrPaymentFetchingService from "services/payment/qr_payment/fetch-service";
import ManualPaymentService from "services/payment/manual-pay/payment";

export default {
  ManualPaymentService: ManualPaymentService,
  QrPaymentFetchingService,
  ManualPaymentFetchingService,
  MisaVoucherCreator
};
