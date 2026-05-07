import * as Sentry from "@sentry/cloudflare";
import PancakePOSClient from "services/clients/pancake-pos-client";
import PancakePOSOrderMapper from "services/pancake/order/pancake-pos-order-mapper";
import FrappeClient from "frappe/frappe-client";

const SHOP_ID_MAP = {
  "jemmia cần thơ": 714173334,
  "jemmia diamond": 2278067,
  "jemmia hà nội": 2173870,
  "kiệt hột xoàn": 5144928
};

const PAGE_ID_MAP = {
  "jemmia cần thơ": "529651860237848",
  "jemmia diamond": "110263770893806",
  "jemmia hà nội": "104886481441594",
  "kiệt hột xoàn": "114459901519364"
};

const WAREHOUSE_ID = "70f9f88b-cb7c-4bf4-b9df-287d2e91a39a";

export default class PancakePOSOrderService {
  constructor(env) {
    this.env = env;
    this.client = null;
    this.frappeClient = null;
  }

  getClient() {
    if (!this.client) {
      const apiKey = this.env.PANCAKE_POS_API_KEY;
      if (!apiKey) {
        throw new Error("PANCAKE_POS_API_KEY is not configured in environment");
      }
      this.client = new PancakePOSClient(apiKey);
    }
    return this.client;
  }

  getFrappeClient() {
    if (!this.frappeClient) {
      this.frappeClient = new FrappeClient({
        url: this.env.JEMMIA_ERP_BASE_URL,
        apiKey: this.env.JEMMIA_ERP_API_KEY,
        apiSecret: this.env.JEMMIA_ERP_API_SECRET
      });
    }
    return this.frappeClient;
  }

  extractCustomerInfo(haravanOrder) {
    const shippingAddress = haravanOrder.shipping_address || {};
    const billingAddress = haravanOrder.billing_address || {};
    const customer = haravanOrder.customer || {};

    const phone = shippingAddress.phone || billingAddress.phone || customer.phone || null;
    const name = shippingAddress.name || billingAddress.name || customer.first_name || customer.name || null;
    const gender = customer.gender || null;

    return { phone, name, gender };
  }

  async getLeadFromERP(phone) {
    if (!phone) return null;

    try {
      const frappeClient = this.getFrappeClient();

      const leads = await frappeClient.getList("Lead", {
        filters: [["phone", "=", phone]],
        fields: ["name", "lead_source_name", "pancake_data"],
        limit_page_length: 1
      });

      if (!leads || leads.length === 0) {
        return null;
      }

      return leads[0];
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  extractConversationIdFromPancakeData(pancakeData) {
    if (!pancakeData) return null;

    try {
      const parsed = typeof pancakeData === "string" ? JSON.parse(pancakeData) : pancakeData;
      return parsed.conversation_id || null;
    } catch {
      return null;
    }
  }

  getPageIdBySource(sourceName) {
    if (!sourceName) return null;

    const normalizedSource = sourceName.toLowerCase();

    for (const [key, pageId] of Object.entries(PAGE_ID_MAP)) {
      if (normalizedSource.includes(key)) {
        return pageId;
      }
    }

    return null;
  }

  getShopIdBySource(sourceName) {
    if (!sourceName) return null;

    const normalizedSource = sourceName.toLowerCase();

    for (const [key, shopId] of Object.entries(SHOP_ID_MAP)) {
      if (normalizedSource.includes(key)) {
        return shopId;
      }
    }

    return null;
  }

  async createOrderFromHaravan(haravanOrder) {
    try {
      const customerInfo = this.extractCustomerInfo(haravanOrder);

      if (!customerInfo.phone || !customerInfo.name) {
        console.warn(`No customer info (phone/name) found for Haravan order ${haravanOrder.order_number}, canceling flow`);
        return { success: false, canceled: true, reason: "no_customer_info" };
      }

      const lead = await this.getLeadFromERP(customerInfo.phone);

      if (!lead) {
        console.warn(`No lead found in ERP for phone: ${customerInfo.phone}, canceling flow`);
        return { success: false, canceled: true, reason: "no_lead" };
      }

      const sourceName = lead.lead_source_name;
      if (!sourceName) {
        console.warn(`No lead_source_name for phone: ${customerInfo.phone}, canceling flow`);
        return { success: false, canceled: true, reason: "no_source_name" };
      }

      const conversationId = this.extractConversationIdFromPancakeData(lead.pancake_data);

      const shopId = this.getShopIdBySource(sourceName);

      if (!shopId) {
        console.warn(`No shop ID found for source: ${sourceName}, canceling flow`);
        return { success: false, canceled: true, reason: "no_shop_id" };
      }

      const existingOrder = await this.findExistingOrderByCustomId(shopId, haravanOrder.order_number);
      if (existingOrder) {
        console.warn(`Order ${haravanOrder.order_number} already exists in Pancake POS, skipping`);
        return { success: true, skipped: true, data: existingOrder };
      }

      const config = await this.buildOrderConfig(shopId, sourceName, conversationId);

      const pancakeOrderData = PancakePOSOrderMapper.mapHaravanToPancakeOrder(haravanOrder, config);

      const response = await this.getClient().createOrder(shopId, pancakeOrderData);

      console.warn(`Successfully created Pancake POS order for Haravan order ${haravanOrder.order_number}`);

      return {
        success: true,
        skipped: false,
        data: response,
        haravan_order_id: haravanOrder.id,
        haravan_order_number: haravanOrder.order_number,
        shop_id: shopId,
        source_name: sourceName,
        conversation_id: conversationId
      };
    } catch (error) {
      Sentry.captureException(error);
      console.warn(`Failed to create Pancake POS order for Haravan order ${haravanOrder.order_number}:`, error.message);
      throw error;
    }
  }

  async buildOrderConfig(shopId, sourceName, conversationId) {
    const pageId = this.getPageIdBySource(sourceName);

    const config = {
      shop_id: shopId,
      page_id: pageId,
      conversation_id: conversationId,
      warehouse_id: WAREHOUSE_ID,
      warehouse_info: null
    };

    if (config.warehouse_id && !config.warehouse_info) {
      config.warehouse_info = await this.getWarehouseInfo(shopId, config.warehouse_id);
    }

    return config;
  }

  async getWarehouseInfo(shopId, warehouseId) {
    try {
      const warehouses = await this.getClient().getWarehouses(shopId);
      if (warehouses && warehouses.data) {
        const warehouse = warehouses.data.find(w => w.id === warehouseId);
        if (warehouse) {
          return {
            name: warehouse.name,
            phone_number: warehouse.phone_number,
            full_address: warehouse.full_address,
            province_id: warehouse.province_id,
            district_id: warehouse.district_id
          };
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }

    return null;
  }

  async findExistingOrderByCustomId(shopId, orderNumber) {
    try {
      const orders = await this.getClient().getOrders(shopId, { custom_id: orderNumber });

      if (orders && orders.data && orders.data.length > 0) {
        return orders.data[0];
      }
    } catch (error) {
      Sentry.captureException(error);
    }

    return null;
  }

  static async dequeuePancakeOrderQueue(batch, env) {
    const service = new PancakePOSOrderService(env);

    for (const message of batch.messages) {
      try {
        const haravanOrder = message.body;

        const haravanTopic = haravanOrder.haravan_topic;
        if (haravanTopic !== "orders/create") {
          continue;
        }

        await service.createOrderFromHaravan(haravanOrder);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
