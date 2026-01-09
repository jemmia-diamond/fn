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
  "pos-cua-hang-hcm": { unit_code: "0302_001", credit_account: "1310001" },
  "pos-cua-hang-hn": { unit_code: "0302_002", credit_account: "1310101" },
  "pos cua hang can tho": { unit_code: "0302_003", credit_account: "1310002" },
  "tiktokshop": { unit_code: "0700", credit_account: "1310301" },
  "web": { unit_code: "0700", credit_account: "1310301" },
  "fbshop": { unit_code: "0700", credit_account: "1310301" },
  "phone": { unit_code: "0301", credit_account: "1310302" },
  "zalo": { unit_code: "0301", credit_account: "1310302" },
  "zalo-cong-ty-cap": { unit_code: "0301", credit_account: "1310302" },
  "fb-jemmia-hcm": { unit_code: "0301", credit_account: "1310302" },
  "fb-jemmia-hn": { unit_code: "0301", credit_account: "1310302" },
  "fb-kiet-hot-xoan": { unit_code: "0301", credit_account: "1310302" },
  "bhsc-cua-hang-hcm": { unit_code: "0302_001", credit_account: "1310001" },
  "bhsc-cua-hang-hn": { unit_code: "0302_002", credit_account: "1310101" }
};

export const BRANCH_TO_UNIT_CODE = {
  "Hồ Chí Minh": { unit_code: "0302_001", credit_account: "1310001" },
  "Hà Nội": { unit_code: "0302_002", credit_account: "1310101" },
  "Cần Thơ": { unit_code: "0302_003", credit_account: "1310002" }
};

export function buildOrgUnitMap(orgUnitDictionary) {
  return orgUnitDictionary.reduce((map, item) => {
    if (item.organization_unit_code) {
      map[item.organization_unit_code] = {
        unit_id: item.organization_unit_id || null,
        unit_name: item.organization_unit_name || null,
        unit_code: item.organization_unit_code
      };
    }
    return map;
  }, {});
}

export function getCreditInfo(orgUnitMap, source, branch = null, isManualPayment = false) {
  const sourceInfo = isManualPayment
    ? BRANCH_TO_UNIT_CODE[branch]
    : SOURCE_TO_UNIT_CODE[source];

  if (!sourceInfo) return {};

  const unitCode = sourceInfo.unit_code;
  const orgUnit = orgUnitMap[unitCode] || {};

  return {
    credit_account: sourceInfo.credit_account,
    unit_id: orgUnit.unit_id || null,
    unit_name: orgUnit.unit_name || null,
    unit_code: unitCode
  };
}

export const MANUAL_PAYMENT_DEBIT_MAP = {
  "Hồ Chí Minh": "1111000",
  "Hà Nội": "1111100",
  "Cần Thơ": "1111300"
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
