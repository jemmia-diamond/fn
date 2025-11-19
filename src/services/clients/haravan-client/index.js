import CustomerConnector from "services/clients/haravan-client/customer";
import ProductConnector from "services/clients/haravan-client/product";
import ProductVariantConnector from "services/clients/haravan-client/product-variant";
import ProductImageConnector from "services/clients/haravan-client/product-image";
import OrderConnector from "services/clients/haravan-client/order";
import RefundOrderConnector from "services/clients/haravan-client/order-refund";
import TransactionOrderConnector from "services/clients/haravan-client/order-transaction";
import InventoryAdjustmentConnector from "services/clients/haravan-client/inventory-adjustment";
import InventoryLocationConnector from "services/clients/haravan-client/inventory-location";
import InventoryPurchaseOrderConnector from "services/clients/haravan-client/inventory-purchase-order";
import InventoryPurchaseReceiveConnector from "services/clients/haravan-client/inventory-purchase-receive";
import InventoryPurchaseReturnConnector from "services/clients/haravan-client/inventory-purchase-return";
import InventoryTransferConnector from "services/clients/haravan-client/inventory-transfer";
import LocationConnector from "services/clients/haravan-client/location";
import CollectConnector from "services/clients/haravan-client/collect";
import CustomCollectConnector from "services/clients/haravan-client/collect-custom";

class HaravanAPI {
  constructor(accessToken) {
    this.customer = new CustomerConnector(accessToken);
    this.product = new ProductConnector(accessToken);
    this.productVariant = new ProductVariantConnector(accessToken);
    this.productImage = new ProductImageConnector(accessToken);
    this.order = new OrderConnector(accessToken);
    this.orderRefund = new RefundOrderConnector(accessToken);
    this.orderTransaction = new TransactionOrderConnector(accessToken);
    this.inventoryAdjustment = new InventoryAdjustmentConnector(accessToken);
    this.inventoryLocation = new InventoryLocationConnector(accessToken);
    this.inventoryPurchaseOrder = new InventoryPurchaseOrderConnector(accessToken);
    this.inventoryPurchaseReceive = new InventoryPurchaseReceiveConnector(accessToken);
    this.inventoryPurchaseReturn = new InventoryPurchaseReturnConnector(accessToken);
    this.inventoryTransfer = new InventoryTransferConnector(accessToken);
    this.location = new LocationConnector(accessToken);
    this.collect = new CollectConnector(accessToken);
    this.collectCustom = new CustomCollectConnector(accessToken);
  }
}

export default HaravanAPI;
