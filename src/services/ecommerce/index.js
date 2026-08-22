import CardService from "services/ecommerce/card/card";
import DiamondService from "services/ecommerce/diamond/diamond";
import DiamondCollectService from "services/ecommerce/diamond/diamond-collect-service";
import FormService from "services/ecommerce/form/form";
import JewelryDiamondPairService from "services/ecommerce/jewelry-diamond-pair-service";
import IndDayStatService from "services/ecommerce/order/ind-day-stat";
import OrderNotificationService from "services/ecommerce/order-notification/order-notification";
import OrderTrackingService from "services/ecommerce/order-tracking/order-tracking";
import ProductService from "services/ecommerce/product/product";
import ProductG1PromotionSyncService from "services/ecommerce/product/product-g1-promotion-sync-service";
import ProductVariantPromotionSyncService from "services/ecommerce/product/product-variant-promotion-sync-service";
import VariantSyncService from "services/ecommerce/variant/variant-sync-service";
import WarehouseService from "services/ecommerce/warehouse/warehouse";
import SendZaloMessage from "services/ecommerce/zalo-message/zalo-message";

export default {
  ProductService: ProductService,
  IndDayStatService: IndDayStatService,
  OrderTrackingService: OrderTrackingService,
  SendZaloMessage: SendZaloMessage,
  OrderNotificationService: OrderNotificationService,
  CardService: CardService,
  WarehouseService: WarehouseService,
  DiamondService: DiamondService,
  JewelryDiamondPairService: JewelryDiamondPairService,
  FormService: FormService,
  DiamondCollectService: DiamondCollectService,
  VariantSyncService,
  ProductG1PromotionSyncService,
  ProductVariantPromotionSyncService
};
