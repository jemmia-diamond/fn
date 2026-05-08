import * as Sentry from "@sentry/cloudflare";
import PancakePOSClient from "services/clients/pancake-pos-client";
import PancakePOSOrderMapper from "services/pancake/order/pancake-pos-order-mapper";
import LeadService from "services/erp/crm/lead/lead";
import { normalizeToStandardFormat } from "services/utils/phone-utils";

const PAGE_ID_MAP = {
  "jemmia cần thơ": "529651860237848", // this page id in Pancake, it serve to root order from FB
  "jemmia diamond": "110263770893806",
  "jemmia hà nội": "104886481441594",
  "kiệt hột xoàn": "114459901519364"
};

export default class PancakePOSOrderService {
  constructor(env) {
    this.env = env;
    this.client = null;
    this.leadService = null;
    this.shopId = 714173334; // this shop id has orders
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

  getLeadService() {
    if (!this.leadService) {
      this.leadService = new LeadService(this.env);
    }
    return this.leadService;
  }

  async getLeadFromERP(phone) {
    if (!phone) return null;

    try {
      const leadService = this.getLeadService();
      const normalizedPhone = normalizeToStandardFormat(phone);

      const leads = await leadService.frappeClient.getList("Lead", {
        or_filters: [
          ["phone", "=", phone],
          ["phone", "=", normalizedPhone]
        ],
        fields: ["name", "lead_source_name", "pancake_data"],
        limit_page_length: 1
      });

      return leads?.[0] ?? null;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async getContactsFromERP(leadName) {
    try {
      const leadService = this.getLeadService();
      return await leadService.frappeClient.getList("Contact", {
        filters: [["Dynamic Link", "link_name", "=", leadName]],
        fields: ["source_name", "pancake_page_id", "pancake_conversation_id"]
      });
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  extractCustomerInfo(haravanOrder) {
    const shippingAddress = haravanOrder.shipping_address || {};
    const billingAddress = haravanOrder.billing_address || {};
    const customer = haravanOrder.customer || {};

    const phone =
      shippingAddress.phone || billingAddress.phone || customer.phone || null;
    const name =
      shippingAddress.name ||
      billingAddress.name ||
      customer.first_name ||
      customer.name ||
      null;
    const gender = customer.gender || null;

    return { phone, name, gender };
  }

  extractConversationIdFromPancakeData(pancakeData) {
    if (!pancakeData) return null;

    try {
      const parsed =
        typeof pancakeData === "string" ? JSON.parse(pancakeData) : pancakeData;
      return parsed.conversation_id || null;
    } catch {
      return null;
    }
  }

  getPageIdBySource(sourceName) {
    const normalizedSource = sourceName.toLowerCase();

    for (const [key, pageId] of Object.entries(PAGE_ID_MAP)) {
      if (normalizedSource.includes(key)) {
        return pageId;
      }
    }

    return PAGE_ID_MAP["jemmia diamond"];
  }

  async createOrderFromHaravan(haravanOrder) {
    try {
      const customerInfo = this.extractCustomerInfo(haravanOrder);

      if (!customerInfo.phone || !customerInfo.name) {
        console.warn(
          `No customer info (phone/name) found for Haravan order ${haravanOrder.id}, canceling flow`
        );
        return { success: false, canceled: true, reason: "no_customer_info" };
      }

      const lead = await this.getLeadFromERP(customerInfo.phone);

      if (!lead) {
        console.warn(
          `No lead found in ERP for phone: ${customerInfo.phone}, canceling flow`
        );
        return { success: false, canceled: true, reason: "no_lead" };
      }

      const contacts = await this.getContactsFromERP(lead.name);
      const fbContact = contacts.find((c) => c.source_name?.includes("FB"));

      if (!fbContact) {
        console.warn(`No FB contact found for lead ${lead.name}, canceling flow`);
        return { success: false, canceled: true, reason: "no_fb_contact" };
      }

      const sourceName = fbContact.source_name || lead.lead_source_name;
      if (!sourceName) {
        console.warn(`No source name found for lead ${lead.name}, canceling flow`);
        return { success: false, canceled: true, reason: "no_source_name" };
      }

      const shopId = this.shopId;
      const pageId =
        fbContact?.pancake_page_id || this.getPageIdBySource(sourceName);
      const conversationId =
        fbContact?.pancake_conversation_id ||
        this.extractConversationIdFromPancakeData(lead.pancake_data);

      const config = await this.buildOrderConfig(
        shopId,
        pageId,
        conversationId
      );
      const pancakeOrderData = PancakePOSOrderMapper.mapHaravanToPancakeOrder(
        haravanOrder,
        config
      );

      const existingOrder = await this.findExistingOrderByCustomId(
        shopId,
        haravanOrder.id
      );

      let response;
      let isUpdate = false;

      if (existingOrder) {
        const orderId = existingOrder.system_id || existingOrder.id;
        const updatePayload = {
          bill_full_name: pancakeOrderData.bill_full_name,
          bill_phone_number: pancakeOrderData.bill_phone_number,
          note: pancakeOrderData.note,
          shipping_fee: pancakeOrderData.shipping_fee,
          total_discount: pancakeOrderData.total_discount,
          status: pancakeOrderData.status,
          cash: pancakeOrderData.cash,
          prepaid: pancakeOrderData.prepaid,
          warehouse_id: pancakeOrderData.warehouse_id,
          warehouse_info: pancakeOrderData.warehouse_info,
          custom_id: pancakeOrderData.custom_id,
          items: pancakeOrderData.items
        };

        response = await this.getClient().updateOrder(
          shopId,
          orderId,
          updatePayload
        );
        isUpdate = true;
        console.warn(
          `Successfully updated Pancake POS order ${haravanOrder.id} (id=${orderId})`
        );
      } else {
        response = await this.getClient().createOrder(shopId, pancakeOrderData);
        console.warn(
          `Successfully created Pancake POS order for Haravan order ${haravanOrder.id}`
        );
      }

      return {
        success: true,
        skipped: false,
        updated: isUpdate,
        data: response,
        haravan_order_id: haravanOrder.id,
        haravan_order_number: haravanOrder.order_number,
        shop_id: shopId,
        source_name: sourceName,
        conversation_id: conversationId
      };
    } catch (error) {
      Sentry.captureException(error);
      console.warn(
        `Failed to create/update Pancake POS order for Haravan order ${haravanOrder.order_number}:`,
        error.message
      );
      throw error;
    }
  }

  async buildOrderConfig(shopId, pageId, conversationId) {
    const warehouse = await this.getDefaultWarehouse(shopId);

    return {
      shop_id: shopId,
      page_id: pageId,
      conversation_id: conversationId,
      warehouse_id: warehouse?.id || null,
      warehouse_info: warehouse
        ? {
          name: warehouse.name,
          phone_number: warehouse.phone_number,
          full_address: warehouse.full_address,
          province_id: warehouse.province_id,
          district_id: warehouse.district_id
        }
        : null
    };
  }

  // Get the default (first) warehouse for any shop
  async getDefaultWarehouse(shopId) {
    try {
      const warehouses = await this.getClient().getWarehouses(shopId);
      return warehouses?.data?.[0] ?? null;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async findExistingOrderByCustomId(shopId, orderId) {
    try {
      const orders = await this.getClient().getOrders(shopId, { ids: orderId });
      return orders?.data?.[0] ?? null;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  static async dequeuePancakeOrderQueue(batch, env) {
    const service = new PancakePOSOrderService(env);

    for (const message of batch.messages) {
      try {
        const haravanOrder = message.body;

        const haravanTopic = haravanOrder.haravan_topic;
        if (haravanTopic !== "orders/create" && haravanTopic !== "orders/update") {
          continue;
        }

        await service.createOrderFromHaravan(haravanOrder);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
