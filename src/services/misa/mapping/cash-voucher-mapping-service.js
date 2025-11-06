import * as crypto from "crypto";
import { CREDIT_ACCOUNT_MAP, DEBIT_ACCOUNT_MAP, EXCHANGE_RATE, MANUAL_PAYMENT_CREDIT_MAP, MANUAL_PAYMENT_DEBIT_MAP, REASON_TYPES, SORT_ORDER, VOUCHER_REF_TYPES, VOUCHER_TYPES } from "services/misa/constant";

export default class CashVoucherMappingService {
  static transforManualToVoucher(v, bankMap, voucher_type = VOUCHER_TYPES.MANUAL_PAYMENT, ref_type = VOUCHER_REF_TYPES.MANUAL_PAYMENT) {
    // Company credit and debit account
    // manual payment using "branch" field (branch is actually vietnamese province)
    const isManual = voucher_type === VOUCHER_TYPES.MANUAL_PAYMENT;

    const debitAccount = isManual
      ? MANUAL_PAYMENT_DEBIT_MAP[v.branch] || null
      : DEBIT_ACCOUNT_MAP[v.bank_name] || null;

    const creditInfo = isManual
      ? MANUAL_PAYMENT_CREDIT_MAP[v.branch] || {}
      : CREDIT_ACCOUNT_MAP[v.haravan_order?.source] || {};

    // Employee code ( from Amis ) and name
    const employee_code = v.haravan_order?.user?.misa_user?.employee_code || v.haravan_order?.user?.misa_user?.email;
    const employee_name = `${v.haravan_order?.user?.last_name} ${v.haravan_order?.user?.first_name}`;

    // Customer's code, name and address
    const customerCode = v.haravan_order?.customer_id?.toString() || null;
    const customerName = `${v.haravan_order?.customer_last_name} ${v.haravan_order?.customer_first_name}`;
    const street1 = v.haravan_order?.customer_default_address_address1;
    const street2 = v.haravan_order?.customer_default_address_address2;
    const ward = v.haravan_order?.customer_default_address_ward;
    const district = v.haravan_order?.customer_default_address_district;
    const province = v.haravan_order?.customer_default_address_province;
    const customerAddress = [street1, street2, ward, district, province].filter(Boolean).join(", ");

    // Bank name mapping
    const bankInfo = bankMap[v.bank_account] || null;
    const bankName = bankInfo ? (bankInfo.bank_branch_name ? `${bankInfo.bank_name} - ${bankInfo.bank_branch_name}` : bankInfo.bank_name) : "Không tìm thấy ngân hàng";
    const generatedGuid = crypto.randomUUID();
    const reason_type_id = voucher_type == VOUCHER_TYPES.MANUAL_PAYMENT ? REASON_TYPES.MANUAL_PAYMENT : REASON_TYPES.OTHER_MANUAL_PAYMENT;

    const misaVoucher = {
      voucher_type,
      org_refid: generatedGuid,
      org_reftype: ref_type,
      branch_id: null,
      reason_type_id,
      reftype: ref_type,
      auto_refno: true,
      refdate: v?.receive_date || v?.created_date,
      posted_date: v?.receive_date || v?.created_date,
      currency_id: "VND",
      exchange_rate: EXCHANGE_RATE,
      total_amount_oc: Number(v.transfer_amount),
      total_amount: Number(v.transfer_amount),
      account_object_name: customerName,
      account_object_address: customerAddress,
      account_object_code: customerCode,
      journal_memo: `Thu tiền đơn hàng ${v.haravan_order_name}`,
      employee_code,
      employee_name,
      created_by: "Tự động hóa",
      modified_by: "Tự động hóa",
      detail: [
        {
          sort_order: SORT_ORDER,
          amount_oc: Number(v.transfer_amount),
          amount: Number(v.transfer_amount),
          description: `Thu tiền đơn hàng ${v.haravan_order_name}`,
          debit_account: debitAccount,
          credit_account: creditInfo.credit_account || null,
          organization_unit_name: creditInfo.unit_name || null,
          organization_unit_code: creditInfo.unit_code || null,
          organization_unit_id: creditInfo.unit_id || null,
          account_object_code: customerCode,
          account_object_name: customerName
        }
      ]
    };

    if (voucher_type == VOUCHER_TYPES.OTHER_MANUAL_PAYMENT) {
      misaVoucher.bank_account_number =  v.bank_account;
      misaVoucher.bank_name = bankName;
    }

    return { misaVoucher, originalId: v.uuid, generatedGuid };
  }
}
