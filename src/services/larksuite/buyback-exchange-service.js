import Database from "services/database";

const EXCHANGE_TYPE = {
  BUYBACK: "Thu Mua",
  PAWN: "Cầm Cố",
  SWAP: "Thu Đổi",
  SIGN: "Ký Gửi"
};

const EXCHANGE_STATUS = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
  PENDING: "PENDING"
};

export default class BuybackExchangeService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async find(params) {
    const {
      phone_number,
      normalized_phone,
      instance_type,
      status,
      submitted_date_start,
      submitted_date_end
    } = params;
    const searchPhone = normalized_phone || phone_number;

    if (!searchPhone) {
      return [];
    }

    const where = {
      normalized_phone: searchPhone
    };

    if (instance_type && instance_type !== "none") {
      where.instance_type = instance_type || EXCHANGE_TYPE.BUYBACK;
    }

    if (status && status !== "none") {
      where.status = status?.toUpperCase() || EXCHANGE_STATUS.APPROVED;
    }

    if (submitted_date_start || submitted_date_end) {
      where.submitted_date = {};
      if (submitted_date_start) {
        where.submitted_date.gte = new Date(submitted_date_start);
      }
      if (submitted_date_end) {
        where.submitted_date.lte = new Date(submitted_date_end);
      }
    }

    return this.db.larksuiteBuybackExchangeApprovalInstance.findMany({ where });
  }
}
