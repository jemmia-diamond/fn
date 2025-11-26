import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class FindQRService {

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async getOneById(id, queryParams = {}) {
    const where = {
      id,
      is_deleted: false
    };

    for (const key in queryParams) {
      if (key !== "id") {
        where[key] = queryParams[key];
      }
    }

    return this.db.qrPaymentTransaction.findFirst({ where });
  }
}
