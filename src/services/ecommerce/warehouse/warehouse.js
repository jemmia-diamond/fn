import Database from "services/database";

export default class WarehouseService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
  }

  async getAvailableWarehouses(productId) {
    const results = await this.db.$queryRaw`
      SELECT
        v.id AS variant_id,
        wi.qty_available,
        wi.loc_id,
        w.name
      FROM haravan.variants v
      JOIN haravan.warehouse_inventories wi ON wi.variant_id = v.id
      JOIN haravan.warehouses w ON w.id = wi.loc_id
      WHERE v.product_id = ${productId}
        AND wi.qty_available > 0
      ORDER BY v.id, w.name;
    `;

    return results.map(r => ({
      variant_id: Number(r.variant_id),
      available_quantity: Number(r.qty_available),
      store_id: Number(r.loc_id),
      store_name: r.name
    }));
  }
}
