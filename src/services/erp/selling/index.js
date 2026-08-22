import BuybackExchangeSyncService from "services/erp/selling/buyback-exchange/buyback-exchange-sync-service";
import ProductCategoryService from "services/erp/selling/product-category/product-category";
import PromotionService from "services/erp/selling/promotion/promotion";
import PurchasePurposeService from "services/erp/selling/purchase_purpose/purchase_purpose";
import MissingSerialNotificationService from "services/erp/selling/sales-order/missing-serial-notification";
import SalesOrderItemService from "services/erp/selling/sales-order-item/sales-order-item";
import SalesPersonService from "services/erp/selling/sales-person/sales-person";
import CustomerService from "src/services/erp/selling/customer/customer";
import DebtTrackingNotificationService from "src/services/erp/selling/order-and-debt-tracking/debt-tracking-notification-service";
import SalesOrderService from "src/services/erp/selling/sales-order/sales-order";
import SerialService from "src/services/erp/selling/serial/serial";

export default {
  SalesOrderService: SalesOrderService,
  CustomerService: CustomerService,
  SerialService: SerialService,
  SalesPersonService: SalesPersonService,
  PurchasePurposeService: PurchasePurposeService,
  ProductCategoryService: ProductCategoryService,
  PromotionService: PromotionService,
  SalesOrderItemService: SalesOrderItemService,
  BuybackExchangeSyncService: BuybackExchangeSyncService,
  MissingSerialNotificationService: MissingSerialNotificationService,
  DebtTrackingNotificationService: DebtTrackingNotificationService
};
