import Ecommerce from "controllers/ecommerce";

export default class PublicAPIRoutes {
  static register(publicApi) {
    const ecommerceNamespaceApi = publicApi.basePath("/ecommerce");

    ecommerceNamespaceApi.get("/product/jewelries", Ecommerce.JewelryController.index);
    ecommerceNamespaceApi.get("/products/jewelries/:id", Ecommerce.JewelryController.show);
    ecommerceNamespaceApi.get("/products/:id/availability", Ecommerce.ProductAvailabilityController.index);

    ecommerceNamespaceApi.get("/ind-day-stats", Ecommerce.IndDayStatController.show);
    ecommerceNamespaceApi.get("/order-trackings/:id", Ecommerce.OrderTrackingController.show);
  };
};
