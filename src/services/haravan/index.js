import HaravanClient from "src/services/haravan/haravan-client";
import Orders from "services/haravan/orders";
import Product from "services/haravan/products";
import Collect from "services/haravan/collects";
import WarehouseInventory from "services/haravan/warehouse-inventories";
import Customer from "services/haravan/customers";
import Users from "services/haravan/users";
import Pages from "services/haravan/pages";

export default {
  HaravanClient: HaravanClient,
  OrderModule: Orders,
  Product: Product,
  Collect: Collect,
  WarehouseInventory,
  Users,
  Customer,
  Pages
};
