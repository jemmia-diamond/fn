import Ecommerce from "controllers/ecommerce";

export default class PublicAPIRoutes {
  static register(publicApi) {
    const ecommerceNamespaceApi = publicApi.basePath("/ecommerce");

    ecommerceNamespaceApi.get("/products/jewelries", Ecommerce.JewelryController.index);
    ecommerceNamespaceApi.get("/products/jewelries/:id", Ecommerce.JewelryController.show);
    ecommerceNamespaceApi.get("/products/:id/availability", Ecommerce.ProductAvailabilityController.index);
    ecommerceNamespaceApi.get("/products/wedding_rings", Ecommerce.WeddingRingController.index);
    ecommerceNamespaceApi.get("/products/wedding_rings/:id", Ecommerce.WeddingRingController.show);

    ecommerceNamespaceApi.get("/v2/products/jewelries", Ecommerce.JewelryControllerV2.index);
    ecommerceNamespaceApi.get("/v2/products/jewelries/:id", Ecommerce.JewelryControllerV2.show);

    ecommerceNamespaceApi.get("/ind-day-stats", Ecommerce.IndDayStatController.show);
    ecommerceNamespaceApi.get("/order-trackings/:id", Ecommerce.OrderTrackingController.show);

    // Diamond
    ecommerceNamespaceApi.get("/products/diamonds", Ecommerce.DiamondController.show);
    ecommerceNamespaceApi.get("/products/diamonds/gia-report", Ecommerce.DiamondProfileImageController.show);
    ecommerceNamespaceApi.get("/products/diamonds/:id", Ecommerce.DiamondController.index);

    // Search
    ecommerceNamespaceApi.get("/search", Ecommerce.SearchController.index);

    // Web form
    ecommerceNamespaceApi.post("/website-forms", Ecommerce.WebsiteFormSubmissionController.create);
  };
};
