import { Prisma } from "@prisma-cli/client";
import Database from "services/database";

const EXCHANGE_TYPE = {
  BUYBACK: "Thu Mua",
  WITHDRAW: "Cầm cố",
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
    const whereClauses = this.whereClauseGenerator(params);
    if (whereClauses.length === 0) {
      return [];
    }

    const query = Prisma.sql`
      SELECT *
      FROM larksuite.buyback_exchange_approval_instances
      WHERE ${Prisma.join(whereClauses, " AND ")};
    `;

    return this.db.$queryRaw(query);
  }

  whereClauseGenerator(params) {
    const { phone_number, instance_type, status, submitted_date_start, submitted_date_end } = params;

    if (!phone_number) {
      return [];
    }
    const whereClauses = [];

    const digitsOnly = this.normalizePhone(phone_number);
    const matchLength = digitsOnly.length;

    whereClauses.push(
      Prisma.sql`RIGHT(regexp_replace(phone_number::jsonb->>'national_number', '\\D', '', 'g'), ${matchLength}) = ${digitsOnly}`
    );

    if (instance_type != "none") {
      whereClauses.push(Prisma.sql`instance_type = ${instance_type || EXCHANGE_TYPE.BUYBACK}`);
    }

    if (status != "none") {
      whereClauses.push(Prisma.sql`status = ${status?.toUpperCase() || EXCHANGE_STATUS.APPROVED}`);
    }
    if (submitted_date_start) {
      whereClauses.push(Prisma.sql`submitted_date >= ${new Date(submitted_date_start)}`);
    }
    if (submitted_date_end) {
      whereClauses.push(Prisma.sql`submitted_date <= ${new Date(submitted_date_end)}`);
    }

    return whereClauses;
  }

  normalizePhone(phone) {
    if (!phone) return "";

    const digits = phone.replace(/\D/g, "");

    // Add more country codes as needed:
    // +1 (USA/Canada), +84 (Vietnam), +86 (China)
    // +44 (UK), +61 (Australia), +81 (Japan), +82 (South Korea)
    return digits.replace(/^(1|01|44|61|81|82|84|86)/, "");
  }
}
