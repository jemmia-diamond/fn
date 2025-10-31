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
export const CREDIT_ACCOUNT_MAP = {
  "pos-cua-hang-hcm": {
    credit_account: "1310001", unit_id: "9af12d4c-11bc-447a-be41-11396d8dffca",
    unit_name: "Cửa hàng HCM", unit_code: "0302_001"
  },
  "pos-cua-hang-hn": {
    credit_account: "1310101", unit_id: "72a31f58-9432-4df0-861b-9d6b9f228546",
    unit_name: "Cửa hàng HN", unit_code: "0302_002"
  },
  "pos cua hang can tho": {
    credit_account: "1310002", unit_id: "06bb3daa-fd49-469a-b9fa-ad9e6dd8bc24",
    unit_name: "Cửa hàng Cần Thơ", unit_code: "0302_003"
  },
  "tiktokshop": {
    credit_account: "1310301", unit_id: "25c43210-81a2-4452-a1c1-d19c87807d56",
    unit_name: "Phòng Công nghệ", unit_code: "700"
  },
  "web": {
    credit_account: "1310301", unit_id: "25c43210-81a2-4452-a1c1-d19c87807d56",
    unit_name: "Phòng Công nghệ", unit_code: "700"
  },
  "fbshop": {
    credit_account: "1310301", unit_id: "25c43210-81a2-4452-a1c1-d19c87807d56",
    unit_name: "Phòng Công nghệ", unit_code: "700"
  },
  "phone": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "zalo": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "zalo-cong-ty-cap": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "fb-jemmia-hcm": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "fb-jemmia-hn": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "fb-kiet-hot-xoan": {
    credit_account: "1310302", unit_id: "837f2a22-5583-493d-b261-da083fad76db",
    unit_name: "Kinh doanh online", unit_code: "301"
  },
  "bhsc-cua-hang-hcm": {
    credit_account: "1310001", unit_id: "9af12d4c-11bc-447a-be41-11396d8dffca",
    unit_name: "Cửa hàng HCM", unit_code: "0302_001"
  },
  "bhsc-cua-hang-hn": {
    credit_account: "1310001", unit_id: "72a31f58-9432-4df0-861b-9d6b9f228546",
    unit_name: "Cửa hàng HN", unit_code: "0302_002"
  }
};

export const VOUCHER_TYPES = {
  QR_PAYMENT: 1,
  MANUAL_PAYMENT: 5,
  OTHER_MANUAL_PAYMENT: 1
};
