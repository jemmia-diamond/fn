// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import Namespace from "controllers/namespace";
import anotherNamespace from "controllers/another-namespace";
import ERP from "controllers/erp";
import Pancake from "controllers/pancake";
import Dashboard from "controllers/dashboard";
import Ecommerce from "controllers/ecommerce";
import Delivery from "controllers/delivery";

export default class APIRoutes {
  static register(api) {
    /*
    /api/namespace/resources
    */
    const namespaceApi = api.basePath("/namespace");

    namespaceApi.get("/authors", Namespace.authorsController.index);
    namespaceApi.get("/authors/:id", Namespace.authorsController.show);
    namespaceApi.get("/books", Namespace.booksController.index);

    const anotherNamespaceApi = api.basePath("/another_namespace");
    anotherNamespaceApi.get("/foo", anotherNamespace.fooController.index);

    const jemmiaERPNamespaceApi = api.basePath("/erp");
    jemmiaERPNamespaceApi.get("/leads", ERP.LeadController.index);
    jemmiaERPNamespaceApi.patch("/leads/:id", ERP.LeadController.update);

    jemmiaERPNamespaceApi.post("/sales_orders", ERP.SalesOrderController.create);
    jemmiaERPNamespaceApi.post("/sales_orders/:id/notifications", ERP.SalesOrderNotificationController.create);

    const pancakeNamespaceApi = api.basePath("/pancake");
    pancakeNamespaceApi.post("/conversation_assignments", Pancake.ConversationAssignmentController.create);

    const dashboardNamespaceApi = api.basePath("/dashboard");
    dashboardNamespaceApi.get("/tv", Dashboard.TVController.show);

    const ecommerceNamespaceApi = api.basePath("/ecommerce");
    ecommerceNamespaceApi.get("/search", Ecommerce.SearchController.index);
    ecommerceNamespaceApi.get("/product/jewelries", Ecommerce.JewelryController.index); // [DEPRECATED]
    ecommerceNamespaceApi.get("/product/diamonds", Ecommerce.DiamondController.index);
    ecommerceNamespaceApi.get("/product/wedding_rings", Ecommerce.WeddingRingController.index);

    ecommerceNamespaceApi.get("/products/diamonds", Ecommerce.DiamondController.index);
    ecommerceNamespaceApi.get("/products/jewelries", Ecommerce.JewelryController.index);
    ecommerceNamespaceApi.get("/products/wedding_rings", Ecommerce.WeddingRingController.index);
    ecommerceNamespaceApi.delete("/ind-day-stats", Ecommerce.IndDayStatController.destroy);

    ecommerceNamespaceApi.get("/card/:id", Ecommerce.CardController.show);
    ecommerceNamespaceApi.post("/card", Ecommerce.CardController.create);
    ecommerceNamespaceApi.patch("/card/:id", Ecommerce.CardController.update);

    const nhattinNamespaceApi = api.basePath("/delivery");
    nhattinNamespaceApi.get("/nhattin", Delivery.DeliveryTrackingController.show);
  };
};
