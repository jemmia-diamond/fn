import SalesOrderService from "src/services/erp/selling/sales-order/sales-order";
import CustomerService from "src/services/erp/selling/customer/customer";
import SerialService from "src/services/erp/selling/serial/serial";
import SalesPersonService from "services/erp/selling/sales-person/sales-person";
import PurchasePurposeService from "services/erp/selling/purchase_purpose/purchase_purpose";
import ProductCategoryService from "services/erp/selling/product-category/product-category";
import PromotionService from "services/erp/selling/promotion/promotion";
import SalesOrderItemService from "services/erp/selling/sales-order-item/sales-order-item";

export default {
  SalesOrderService: SalesOrderService,
  CustomerService: CustomerService,
  SerialService: SerialService,
  SalesPersonService: SalesPersonService,
  PurchasePurposeService: PurchasePurposeService,
  ProductCategoryService: ProductCategoryService,
  PromotionService: PromotionService,
  SalesOrderItemService: SalesOrderItemService
};
