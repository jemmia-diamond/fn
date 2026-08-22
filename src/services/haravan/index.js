import HaravanAPI from "services/clients/haravan-client";
import AccountingSalesOrders from "services/haravan/accounting-sales-orders";
import Articles from "services/haravan/articles";
import Collect from "services/haravan/collects";
import ConfigTranslator from "services/haravan/config-translator";
import Customer from "services/haravan/customers";
import Orders from "services/haravan/orders";
import Product from "services/haravan/products";
import Users from "services/haravan/users";
import WarehouseInventory from "services/haravan/warehouse-inventories";

export default {
  HaravanAPI: HaravanAPI,
  OrderModule: Orders,
  Product: Product,
  Collect: Collect,
  WarehouseInventory,
  Users,
  Customer,
  Articles,
  AccountingSalesOrders,
  ConfigTranslator
};
