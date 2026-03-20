import OrderService from "services/haravan/orders/order-service/order-service";
import OrderDatabaseSyncService from "services/haravan/orders/database-sync-service";

export default {
  OrderService,
  DatabaseSyncService: OrderDatabaseSyncService
};
