// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import Namespace from "../controllers/namespace";
import anotherNamespace from "../controllers/another-namespace";
import ERP from "../controllers/erp";

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
    jemmiaERPNamespaceApi.post("/orders", ERP.OrderController.create);
  };
};
