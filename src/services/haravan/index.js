import HaravanClient from "src/services/haravan/haravan-client";
import Orders from "services/haravan/orders";
import Product from "services/haravan/products";
import Collect from "services/haravan/collects";
import WarehouseInventory from "services/haravan/warehouse-inventories";
import Users from "services/haravan/users";

export default {
  HaravanClient: HaravanClient,
  OrderModule: Orders,
  Product: Product,
  Collect: Collect,
  WarehouseInventory,
  Users
};
