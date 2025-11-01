import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import RecordService from "services/larksuite/docs/base/record/record";
import { TABLES } from "services/larksuite/docs/constant";

export default class ProductQuoteOrderService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env, "neon");
  }

  static async dequeueOrderQueue(batch, _env) {
    const messages = batch.messages || [];
    for (const message of messages) {
      try {
        const orderData = message.body;
        await ProductQuoteOrderService.syncOrderToLark(_env, orderData);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  /**
   * Processes a new order from a webhook, finds its temporary products,
   * and updates their records in Larksuite to link the new order.
   * @param {object} env - env
   * @param {object} createdOrder - order from haravan webhook.
   */
  static async syncOrderToLark(env, createdOrder) {
    try {
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

      const productQuoteOrderService = new ProductQuoteOrderService(env);
      const db = productQuoteOrderService.db;
      const LARK_ORDER_KEY = "Đơn hàng";
      const LARK_LINK_ORDER_KEY = "Link Đơn hàng";
      const APP_TOKEN = TABLES.TEMP_PRODUCT_QUOTE.app_token;
      const TABLE_ID = TABLES.TEMP_PRODUCT_QUOTE.table_id;

      for (const lineItem of lineItems) {
        try {
          const variantId = lineItem.variant_id;
          if (!variantId) continue;

          const dbTempVariant = await this._findTemporaryProductByVariantId(
            db,
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
                multiOrders = Array.isArray(existingOrders)
                  ? existingOrders
                  : [];
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
        } catch (error) {
          Sentry.captureException(error);
        }
      }
    } catch (e) {
      Sentry.captureException(e);
    }
  }

  /**
   * Finds a temporary product by its Haravan variant ID from the database.
   * Note: This is a private helper method.
   * @param {object} db - The database client instance.
   * @param {number} haravanVariantId - The variant ID from Haravan.
   * @returns {Promise<object|null>} - The temporary product record or null if not found.
   */
  static async _findTemporaryProductByVariantId(db, haravanVariantId) {
    const results = await db.$queryRaw`
      SELECT 
        lark_base_record_id
      FROM "workplace"."temporary_products"
      WHERE haravan_variant_id = ${haravanVariantId} 
      LIMIT 1;
    `;

    if (results && results.length > 0) {
      return results[0];
    }
    return null;
  }
}
