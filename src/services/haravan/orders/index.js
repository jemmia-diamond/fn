import OrderService from "services/haravan/orders/order-service/order-service";
import OrderDatabaseSyncService from "services/haravan/orders/database-sync-service";
import ERPNextOrderCreationSyncService from "services/haravan/orders/erpnext-sync-service";

export default {
  OrderService,
  DatabaseSyncService: OrderDatabaseSyncService,
  ERPNextOrderCreationSyncService
};
