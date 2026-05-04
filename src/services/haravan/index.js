import HaravanClient from "src/services/haravan/haravan-client";
import Orders from "services/haravan/orders";
import Product from "services/haravan/products";
import Collect from "services/haravan/collects";
import WarehouseInventory from "services/haravan/warehouse-inventories";
import Customer from "services/haravan/customers";
import Users from "services/haravan/users";
import Articles from "services/haravan/articles";
import AccountingSalesOrders from "services/haravan/accounting-sales-orders";

export default {
  HaravanClient: HaravanClient,
  OrderModule: Orders,
  Product: Product,
  Collect: Collect,
  WarehouseInventory,
  Users,
  Customer,
  Articles,
  AccountingSalesOrders
};
