import ProductService from "services/ecommerce/product/product";
import IndDayStatService from "services/ecommerce/order/ind-day-stat";
import OrderTrackingService from "services/ecommerce/order-tracking/order-tracking";
import SendZaloMessage from "services/ecommerce/zalo-message/zalo-message";
import OrderNotificationService from "services/ecommerce/order-notification/order-notification";
import CardService from "services/ecommerce/card/card";
import WarehouseService from "services/ecommerce/warehouse/warehouse";

export default {
  ProductService: ProductService,
  IndDayStatService: IndDayStatService,
  OrderTrackingService: OrderTrackingService,
  SendZaloMessage: SendZaloMessage,
  OrderNotificationService: OrderNotificationService,
  CardService: CardService,
  WarehouseService: WarehouseService
};
