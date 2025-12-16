import PaymentEntryService from "services/erp/accounting/payment-entry/payment-entry";
import SepayTransactionService from "services/erp/accounting/sepay-transaction/sepay-transaction";
import * as PaymentEntryConstants from "services/erp/accounting/payment-entry/constants";
import BankTransactionVerificationService from "services/erp/accounting/payment-entry/verification-service";

export default {
  PaymentEntryService: PaymentEntryService,
  SepayTransactionService: SepayTransactionService,
  BankTransactionVerificationService,
  PaymentEntryConstants
};
