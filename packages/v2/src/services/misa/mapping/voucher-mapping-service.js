import { CREDIT_ACCOUNT_MAP, DEBIT_ACCOUNT_MAP } from "services/misa/constant";

export default class VoucherMappingService {
  /**
   * Return valid voucher payload for MISA
   * @param {QrPaymentFetchingService} v
   * @param any bankMap bank dictionary
   * @param {Number} voucher_type voucher type - check here https://actdocs.misa.vn/g2/graph/ACTOpenAPIHelp/index.html#3-1
   * @param {Number} ref_type reference type - check here https://actdocs.misa.vn/g2/graph/ACTOpenAPIHelp/index.html#3-9
   * @returns
   */
  static transformQrToVoucher(v, bankMap, voucher_type, ref_type) {
    // Company credit and debit account
    const creditInfo = CREDIT_ACCOUNT_MAP[v.haravan_order?.source] || {};
    const debitAccount = DEBIT_ACCOUNT_MAP[v.bank_code] || null;

    // Employee code ( from Amis ) and name
    const employee_code = v.haravan_order?.misa_user?.employee_code || `${v.haravan_order?.user?.first_name}.${v.haravan_order?.user?.last_name}@jemmia.vn`;
    const employee_name = `${v.haravan_order?.user?.last_name} ${v.haravan_order?.user?.first_name}`;

    // Customer's code, name and address
    const customerCode = v.haravan_order?.customer_id?.toString() || null;
    const customerName = v.customer_name;
    const street1 = v.haravan_order?.customer_default_address_address1;
    const street2 = v.haravan_order?.customer_default_address_address2;
    const ward = v.haravan_order?.customer_default_address_ward;
    const district = v.haravan_order?.customer_default_address_district;
    const province = v.haravan_order?.customer_default_address_province;
    const customerAddress = [street1, street2, ward, district, province].filter(Boolean).join(", ");

    // Bank name mapping
    const bankInfo = bankMap[v.bank_account_number];
    const bankName = bankInfo ? (bankInfo.bank_branch_name ? `${bankInfo.bank_name} - ${bankInfo.bank_branch_name}` : bankInfo.bank_name) : "Bank name not found";

    return {
      voucher_type,
      org_refid: crypto.randomUUID(),
      org_reftype: ref_type,
      branch_id: null,
      reason_type_id: 29,
      reftype: ref_type,
      auto_refno: true,
      refdate: v?.updated_at || v?.created_at,
      posted_date: v?.updated_at || v?.created_at,
      currency_id: "VND",
      bank_account_number: v.bank_account_number,
      bank_name: bankName,
      exchange_rate: 1,
      total_amount_oc: Number(v.transfer_amount),
      total_amount: Number(v.transfer_amount),
      account_object_name: customerName,
      account_object_address: customerAddress,
      account_object_code: customerCode,
      journal_memo: `Thu tiền đơn hàng ${v.haravan_order_number}`,
      employee_code,
      employee_name,
      created_by: "Tự động hóa",
      modified_by: "Tự động hóa",
      detail: [
        {
          sort_order: 0,
          amount_oc: Number(v.transfer_amount),
          amount: Number(v.transfer_amount),
          description: `Thu tiền đơn hàng ${v.haravan_order_number}`,
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
  }
}
