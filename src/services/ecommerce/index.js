import ProductService from "services/ecommerce/product/product";
import IndDayStatService from "services/ecommerce/order/ind-day-stat";
import OrderTrackingService from "services/ecommerce/order-tracking/order-tracking";
import SendZaloMessage from "services/ecommerce/send-zalo-message/send-zalo-message";

export default {
  ProductService: ProductService,
  IndDayStatService: IndDayStatService,
  OrderTrackingService: OrderTrackingService,
  SendZaloMessage: SendZaloMessage
};
