import OrderDatabaseSyncService from "services/haravan/orders/database-sync-service";
import OrderService from "services/haravan/orders/order-service/order-service";

export default {
  OrderService,
  DatabaseSyncService: OrderDatabaseSyncService
};
