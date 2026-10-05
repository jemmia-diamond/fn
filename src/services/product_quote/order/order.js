import Database from "services/database";
import NocoDBClient from "services/clients/nocodb-client";
import RecordService from "services/larksuite/docs/base/record/record";
import { TABLES } from "services/larksuite/docs/constant";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import { isTestOrder } from "services/utils/order-intercepter";

export default class ProductQuoteOrderService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  static async dequeueOrderQueue(batch, _env) {
    const messages = batch.messages || [];
    for (const message of messages) {
      const orderData = message.body;
      if (isTestOrder(orderData)) {
        continue;
      }
      await ProductQuoteOrderService.syncOrderToLark(_env, orderData);
    }
  }

  /**
   * Processes a new order from a webhook, finds its temporary products,
   * and updates their records in Larksuite to link the new order.
   * @param {object} env - env
   * @param {object} createdOrder - order from haravan webhook.
   */
  static async syncOrderToLark(env, createdOrder) {
    const lineItems = createdOrder.line_items || [];

    if (lineItems.length === 0) {
      return;
    }

    const orderId = createdOrder?.id;
    const orderNumber = createdOrder?.order_number;
    const refOrderNumber = createdOrder?.ref_order_number;

    if (!orderId || !orderNumber) {
      throw new Error("orderId and orderNumber cannot be null or undefined");
    }

    const nocoClient = new NocoDBClient(env);
    const LARK_ORDER_KEY = "Đơn hàng";
    const LARK_LINK_ORDER_KEY = "Link Đơn hàng";
    const APP_TOKEN = TABLES.TEMP_PRODUCT_QUOTE.app_token;
    const TABLE_ID = TABLES.TEMP_PRODUCT_QUOTE.table_id;

    for (const lineItem of lineItems) {
      const variantId = lineItem.variant_id;
      if (!variantId) continue;

      const dbTempVariant = await this._findTemporaryProductByVariantId(
        nocoClient,
        variantId
      );

      if (dbTempVariant?.lark_base_record_id) {
        const recordId = dbTempVariant.lark_base_record_id;
        let multiOrders = [];

        if (refOrderNumber) {
          const oldRecord = await RecordService.getLarksuiteRecord({
            env: env,
            appToken: APP_TOKEN,
            tableId: TABLE_ID,
            recordId: recordId,
            userIdType: "open_id"
          });
          if (oldRecord?.fields) {
            const existingOrders = oldRecord.fields[LARK_ORDER_KEY];
            multiOrders = Array.isArray(existingOrders) ? existingOrders : [];
          }
        }

        if (!multiOrders.includes(String(orderNumber))) {
          multiOrders.unshift(String(orderNumber));
        }

        const fieldsToUpdate = {
          [LARK_LINK_ORDER_KEY]: {
            link: `https://jemmiavn.myharavan.com/admin/orders/${orderId}`,
            text: String(orderNumber)
          },
          [LARK_ORDER_KEY]: multiOrders
        };

        await RecordService.updateLarksuiteRecord({
          env: env,
          appToken: APP_TOKEN,
          tableId: TABLE_ID,
          recordId: recordId,
          fields: fieldsToUpdate,
          userIdType: "open_id"
        });
      }
    }
  }

  /**
   * Finds a temporary product by its Haravan variant ID via the NocoDB REST API.
   * The workplace tables are NocoDB-managed and must be accessed through it, not
   * via direct Postgres queries.
   * Note: This is a private helper method.
   * @param {NocoDBClient} nocoClient - The NocoDB client instance.
   * @param {number} haravanVariantId - The variant ID from Haravan.
   * @returns {Promise<{lark_base_record_id: string}|null>} - The temporary product record or null if not found.
   */
  static async _findTemporaryProductByVariantId(nocoClient, haravanVariantId) {
    const res = await nocoClient.listRecords(
      NOCODB_TABLES.SUPPLY.TEMPORARY_PRODUCTS,
      {
        where: `(haravan_variant_id,eq,${haravanVariantId})`,
        fields: "lark_base_record_id",
        limit: 1
      }
    );

    const record = res.list?.[0];
    return record ? { lark_base_record_id: record.lark_base_record_id } : null;
  }
}
