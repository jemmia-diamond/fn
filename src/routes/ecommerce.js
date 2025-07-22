import Ecommerce from "controllers/ecommerce";

export default class EcommerceRoutes {
  static register(ecommerce) {

    ecommerce.get("/search", Ecommerce.SearchController.index);

    const productBase = ecommerce.basePath("/product");
    productBase.get("/jewelry", Ecommerce.ProductController.index);
  }
}
