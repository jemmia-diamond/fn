import Database from "services/database";

export default class WarehouseService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
     * Fetch list of warehouses from Salesaya service
     *
     * @returns {Promise<Array>} List of warehouses with format:
     *   id: string,
     *   name: string,
     */
  async fetchWarehouses() {
    const warehouses = await this.db.haravanWarehouses.findMany({
      where: {
        name: {
          contains: "Cửa Hàng",
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true
      }
    });
    return warehouses;
  }
}
