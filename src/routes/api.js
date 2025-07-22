// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import Namespace from "../controllers/namespace";
import anotherNamespace from "../controllers/another-namespace";
import ERP from "../controllers/erp";
import Pancake from "../controllers/pancake";
import Dashboard from "../controllers/dashboard";

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

    jemmiaERPNamespaceApi.post("/orders", ERP.OrderController.create);
    jemmiaERPNamespaceApi.post("/orders/:id/notification", ERP.SalesOrderNotificationController.create);

    const pancakeNamespaceApi = api.basePath("/pancake");
    pancakeNamespaceApi.post("/conversation_assignments", Pancake.ConversationAssignmentController.create);

    const dashboardNamespaceApi = api.basePath("/dashboard");
    dashboardNamespaceApi.get("/tv", Dashboard.TVController.show);
  };
};
