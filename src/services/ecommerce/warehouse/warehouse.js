import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildQuery } from "services/ecommerce/warehouse/utils/warehouse";

export default class WarehouseService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async getAvailableWarehouses(productId) {
    const dataSql = buildQuery(productId);
    const results = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;

    return results.map(r => ({
      variant_id: Number(r.variant_id),
      available_quantity: Number(r.qty_available),
      store_id: Number(r.loc_id),
      store_name: r.name
    }));
  }
}
