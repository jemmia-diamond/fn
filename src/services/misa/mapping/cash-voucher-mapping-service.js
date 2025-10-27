import { MANUAL_PAYMENT_CREDIT_MAP, MANUAL_PAYMENT_DEBIT_MAP } from "services/misa/constant";

export default class CashVoucherMappingService {
  static transforManualToVoucher(v, bankMap, voucher_type = 5, ref_type = 1010) {
    // Company credit and debit account
    // this muanl using v.branch (branch is actually vietnamese province)
    const debitAccount = MANUAL_PAYMENT_DEBIT_MAP[v.branch] || null;
    const creditInfo = MANUAL_PAYMENT_CREDIT_MAP[v.branch] || null;

    // Employee code ( from Amis ) and name
    const employee_code = v.haravan_order?.misa_user?.employee_code || `${v.haravan_order?.user?.first_name}.${v.haravan_order?.user?.last_name}@jemmia.vn`;
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
    const misaVoucher = {
      voucher_type,
      org_refid: generatedGuid,
      org_reftype: ref_type,
      branch_id: null,
      reason_type_id: 14,
      reftype: ref_type,
      auto_refno: true,
      refdate: v.receive_date,
      posted_date: v.receive_date,
      created_date: v.receive_date,
      currency_id: "VND",
      bank_account: v.bank_account,
      bank_name: bankName,
      exchange_rate: 1,
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
          sort_order: 0,
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

    return { misaVoucher, originalId: v.uuid, generatedGuid };
  }
}
