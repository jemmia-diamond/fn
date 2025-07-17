import Database from "services/database";
import { buildQuery } from "./utils/jewelry";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async getJewelryData(jsonParams) {
    const {dataSql, countSql} = buildQuery(jsonParams);

    const [data, count] = await Promise.all([
      this.db.$queryRawUnsafe(dataSql),
      this.db.$queryRawUnsafe(countSql)
    ]);

    return {
      data,
      count: Number(count[0].total)
    };
  }

  async getJewelry(jsonParams) {
    const {data, count} = await this.getJewelryData(jsonParams);
    return {
      data,
      metadata: {
        total: count,
        pagination: jsonParams.pagination
      }
    };
  }
}
