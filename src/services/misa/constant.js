/**
 * This constant also relies on the mapping file below.
 */
export const DEBIT_ACCOUNT_MAP = {
  "CTG": "1121001",
  "MB": "1121002",
  "VCB": "1121003",
  "TCB": "1121007"
};

/**
 * `credit_account` comes from this [mapping](https://jemmiadiamond.sg.larksuite.com/wiki/Kix9wWlGDil2aXkVg5ElcxlogMo?from=from_copylink&sheet=dtQEyR).
 * `unit_id`, `unit_name`, and `unit_code` are already saved in AMIS MISA.
 * **unit_id** is important for correct voucher mapping after the accountant creates the accounting document proposal.
 */
export const SOURCE_TO_UNIT_CODE = {
  "pos-cua-hang-hcm": "0302_001",
  "pos-cua-hang-hn": "0302_002",
  "pos cua hang can tho": "0302_003",
  "tiktokshop": "700",
  "web": "700",
  "fbshop": "700",
  "phone": "0301",
  "zalo": "0301",
  "zalo-cong-ty-cap": "0301",
  "fb-jemmia-hcm": "0301",
  "fb-jemmia-hn": "0301",
  "fb-kiet-hot-xoan": "0301",
  "bhsc-cua-hang-hcm": "0302_001",
  "bhsc-cua-hang-hn": "0302_002"
};

/**
 * Maps branch (Vietnamese province) to MISA organization_unit_code for manual payments.
 */
export const BRANCH_TO_UNIT_CODE = {
  "Hồ Chí Minh": "0302_001",
  "Hà Nội": "0302_002",
  "Cần Thơ": "0302_003"
};

export function buildOrgUnitMap(orgUnitDictionary) {
  return orgUnitDictionary.reduce((map, item) => {
    if (item.organization_unit_code) {
      map[item.organization_unit_code] = {
        credit_account: item.receive_account || null,
        unit_id: item.organization_unit_id || null,
        unit_name: item.organization_unit_name || null,
        unit_code: item.organization_unit_code
      };
    }
    return map;
  }, {});
}

export function getCreditInfo(orgUnitMap, source, branch = null, isManualPayment = false) {
  const unitCode = isManualPayment
    ? BRANCH_TO_UNIT_CODE[branch]
    : SOURCE_TO_UNIT_CODE[source];

  return orgUnitMap[unitCode] || {};
}

export const MANUAL_PAYMENT_DEBIT_MAP = {
  "Hồ Chí Minh": 1111000,
  "Hà Nội": 1111100,
  "Cần Thơ": 1111300
};

export const PAYMENT_TYPES = {
  QR_PAYMENT: "QR_PAYMENT",
  MANUAL_PAYMENT: "MANUAL_PAYMENT",
  OTHER_MANUAL_PAYMENT: "OTHER_MANUAL_PAYMENT" // Manual Payment that have payment_type is not "Cash"
};

export const VOUCHER_TYPES = {
  QR_PAYMENT: 1,
  MANUAL_PAYMENT: 5,
  OTHER_MANUAL_PAYMENT: 1
};

export const VOUCHER_MODEL = {
  QR_PAYMENT: "qrPaymentTransaction",
  MANUAL_PAYMENT: "manualPaymentTransaction",
  OTHER_MANUAL_PAYMENT: "manualPaymentTransaction"
};

export const VOUCHER_REF_TYPES = {
  QR_PAYMENT: 1500,
  MANUAL_PAYMENT: 1010,
  OTHER_MANUAL_PAYMENT: 1500
};

export const REASON_TYPES = {
  QR_PAYMENT: 29,
  MANUAL_PAYMENT: 14,
  OTHER_MANUAL_PAYMENT: 29
};

export const EXCHANGE_RATE = 1;
export const SORT_ORDER = 0;
export const CALLBACK_TYPE = {
  SAVE_FUNCTION: 1
};

export const JOB_TYPE = {
  CREATE_QR_VOUCHER: "create_qr_voucher",
  CREATE_MANUAL_VOUCHER: "create_manual_voucher",
  SYNC_CUSTOMER: "sync_customer"
};

export const DELAYS = {
  ONE_MINUTE: 60
};

export const DICTIONARY_TYPE = {
  ACCOUNT_OBJECT: 1
};

export const ACCOUNT_TYPE = {
  CUSTOMER: 0,
  ORGANIZATION: 1
};

export const STATE = {
  ADD: 1,
  EDIT: 2,
  DELETE: 3
};
