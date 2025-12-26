import * as crypto from "crypto";
import HaravanAPI from "services/clients/haravan-client";
import { CREDIT_ACCOUNT_MAP, DEBIT_ACCOUNT_MAP, EXCHANGE_RATE, MANUAL_PAYMENT_CREDIT_MAP, MANUAL_PAYMENT_DEBIT_MAP, REASON_TYPES, SORT_ORDER, VOUCHER_REF_TYPES, VOUCHER_TYPES } from "services/misa/constant";

export default class CashVoucherMappingService {
  static async transforManualToVoucher(v, bankMap, voucher_type = VOUCHER_TYPES.MANUAL_PAYMENT, ref_type = VOUCHER_REF_TYPES.MANUAL_PAYMENT, order_chain = null, env) {
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

    if (!employee_code) {
      throw new Error(`No employee code found for this order id: ${v.haravan_order?.id}`);
    }

    // Customer's code, name and address
    const customerInfo = await CashVoucherMappingService.fetchCustomer(v, v.haravan_order, env);
    const customerCode = customerInfo?.customer_id?.toString();
    const customerName = `${customerInfo?.customer_last_name} ${customerInfo?.customer_first_name}`;
    const street1 = customerInfo?.customer_default_address_address1;
    const street2 = customerInfo?.customer_default_address_address2;
    const ward = customerInfo?.customer_default_address_ward;
    const district = customerInfo?.customer_default_address_district;
    const province = customerInfo?.customer_default_address_province;
    const customerAddress = [street1, street2, ward, district, province].filter(Boolean).join(", ");

    // Bank name mapping
    const bankInfo = bankMap[v.bank_account] || null;
    const bankName = bankInfo ? (bankInfo.bank_branch_name ? `${bankInfo.bank_name} - ${bankInfo.bank_branch_name}` : bankInfo.bank_name) : "Không tìm thấy ngân hàng";
    const generatedGuid = crypto.randomUUID();
    const reason_type_id = voucher_type == VOUCHER_TYPES.MANUAL_PAYMENT ? REASON_TYPES.MANUAL_PAYMENT : REASON_TYPES.OTHER_MANUAL_PAYMENT;
    const orderNumbers = order_chain || v.haravan_order_name;

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
      journal_memo: `Thu tiền đơn hàng ${orderNumbers}`,
      employee_code,
      employee_name,
      created_by: "Tự động hóa",
      modified_by: "Tự động hóa",
      detail: [
        {
          sort_order: SORT_ORDER,
          amount_oc: Number(v.transfer_amount),
          amount: Number(v.transfer_amount),
          description: `Thu tiền đơn hàng ${orderNumbers}`,
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

  static async fetchCustomer(v, haravanOrder, env) {
    if(haravanOrder && haravanOrder?.customer_id) return haravanOrder;

    const accessToken = await env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanAPI(accessToken);
    const haravanResult = await haravanClient.order.getOrder(v.haravan_order_id);
    const customerData = haravanResult?.order?.customer;

    if(!customerData) return null;

    return {
      customer_id: customerData.id,
      customer_first_name: customerData.first_name,
      customer_last_name: customerData.last_name,
      customer_default_address_address1: customerData.default_address?.address1,
      customer_default_address_address2: customerData.default_address?.address2,
      customer_default_address_ward: customerData.default_address?.ward,
      customer_default_address_district: customerData.default_address?.district,
      customer_default_address_province: customerData.default_address?.province
    };
  }
}
