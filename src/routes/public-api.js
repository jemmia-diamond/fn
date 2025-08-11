import Ecommerce from "controllers/ecommerce";

export default class PublicAPIRoutes {
  static register(publicApi) {
    const ecommerceNamespaceApi = publicApi.basePath("/ecommerce");
    ecommerceNamespaceApi.get("/products/:id", Ecommerce.ProductController.show);
  };
};
