import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import LarksuiteService from "services/larksuite/lark";
import RecordService from "services/larksuite/docs/base/record/record";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { negativeStockOrderMessage } from "services/haravan/orders/order-service/helpers/messages-compose";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { toUnixTimestamp } from "services/utils/date-helper";
import { getFinancialStatus } from "services/haravan/orders/order-service/helpers/financial-status";
import { TABLES } from "services/larksuite/docs/constant";
import { BadRequestException } from "src/exception/exceptions";
import HaravanAPI from "services/clients/haravan-client";

export default class OrderService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.hrvClient = new HaravanAPIClient(env);
    this.larkClient = LarksuiteService.createClient(env);
  }

  async invalidOrderNotification(order) {
    const jewelrySKULength = 21;
    const jewelryVariants = order.line_items.filter(item => item.sku && item.sku.toString().length === jewelrySKULength);
    const negativeOrderedVariants = [];
    for (const jewelryVariant of jewelryVariants) {
      const productData = (await this.hrvClient.products.product.getProduct(jewelryVariant.product_id)).data.product;
      const variants = productData.variants;
      const targetVariant = variants.find(variant => variant.id === jewelryVariant.variant_id);
      if (targetVariant.inventory_advance.qty_available < 0) {
        negativeOrderedVariants.push(jewelryVariant);
      }
    }
    if (negativeOrderedVariants.length > 0) {
      const message = negativeStockOrderMessage(order, negativeOrderedVariants);
      await this.larkClient.im.message.create({
        params: {
          receive_id_type: "chat_id"
        },
        data: {
          receive_id: CHAT_GROUPS.NEGATIVE_STOCK_ORDERING_CONTROLL.chat_id,
          msg_type: "text",
          content: JSON.stringify({
            text: message
          })
        }
      });
    }
  }

  async syncOrderToLark(order, haravan_topic) {
    const exists = await this.db.larksuiteOrderQrGenerator.findFirst({
      where: {
        haravan_order_id: order.id
      }
    });
    const paidAmount =
      order.transactions
        ?.filter(t => ["capture", "authorization"].includes(t.kind))
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    const recordFields = {
      "ID": String(order.order_number),
      "Mã đơn hàng": order.order_number,
      "Mã đơn cũ": order.ref_order_number,
      "Trạng thái": getFinancialStatus(order.financial_status),
      "ID đơn hàng": order.id,
      "Tổng số tiền": parseInt(order.total_price),
      "Tên khách hàng": order.billing_address.name,
      "SĐT thanh toán": order.billing_address.phone,
      "SĐT giao hàng": order.shipping_address.phone,
      "Số điện thoại": order.customer.phone,
      "Trạng thái hủy": order.cancelled_status === "cancelled" ? "Đã hủy" : "Chưa hủy",
      "Trạng thái đóng": order.closed_status === "closed" ? "Đã đóng" : "Chưa đóng",
      "Thời gian tạo": toUnixTimestamp(order.created_at),
      "Đã thanh toán": parseInt(paidAmount),
      "Cần thanh toán": parseInt(order.total_price - paidAmount),
      "Đơn mới nhất": order.customer.last_order_name
    };

    const { app_token, table_id } = TABLES.ORDER_QR_GENERATOR;

    if (!exists && haravan_topic === HARAVAN_TOPIC.CREATED) {
      const response = await RecordService.createLarksuiteRecords({
        env: this.env,
        appToken: app_token,
        tableId: table_id,
        records: [recordFields]
      });
      if (response.data.records[0].record_id) {
        await this.db.larksuiteOrderQrGenerator.create({
          data: {
            haravan_order_id: order.id,
            lark_record_id: response.data.records[0].record_id
          }
        });
      }
    }
    if (exists && haravan_topic !== HARAVAN_TOPIC.CREATED) {
      await RecordService.updateLarksuiteRecord({
        env: this.env,
        appToken: app_token,
        tableId: table_id,
        recordId: exists.lark_record_id,
        fields: recordFields
      });
    }

  }

  async syncRefTransactions(order) {
    const refOrderId = order.ref_order_id;
    if (!refOrderId) {
      return;
    }

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const hrvClient = new HaravanAPI(HRV_API_KEY);

    try {
      const refTransactionsResponse = await hrvClient.orderTransaction.getTransactions(refOrderId);

      const refTransactions = refTransactionsResponse.transactions;

      if (!refTransactions || refTransactions.length === 0) {
        return;
      }

      for (const refTransac of refTransactions) {
        const refTransactionAmount = parseFloat(refTransac.amount);
        const refTransactionKind = refTransac.kind;
        const refTransactionGateway = refTransac.gateway;

        if (refTransactionAmount > 0 && ["capture", "authorization"].includes(refTransactionKind.toLowerCase())) {
          const transactionData = {
            amount: refTransactionAmount,
            kind: refTransactionKind,
            gateway: refTransactionGateway
          };

          await hrvClient.orderTransaction.createTransaction(order.id, transactionData);
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async upsertHaravanOrder(order) {
    if (!order.id) return;
    await this.db.order.upsert({
      where: {
        id: order.id
      },
      update: {
        order_number: order.order_number,
        ref_order_id: order.ref_order_id ? BigInt(order.ref_order_id) : null,
        ref_order_number: order.ref_order_number,
        created_at: order.created_at ? new Date(order.created_at) : null,
        financial_status: order.financial_status,
        order_processing_status: order.order_processing_status
      },
      create: {
        uuid: crypto.randomUUID(),
        id: order.id,
        order_number: order.order_number,
        ref_order_id: order.ref_order_id ? BigInt(order.ref_order_id) : null,
        ref_order_number: order.ref_order_number,
        created_at: order.created_at ? new Date(order.created_at) : null,
        financial_status: order.financial_status,
        order_processing_status: order.order_processing_status,
        customer_id: order?.customer?.id,
        customer_first_name: order?.customer?.first_name,
        customer_last_name: order?.customer?.last_name,
        customer_default_address_address1: order?.customer?.default_address.address1,
        customer_default_address_address2: order?.customer?.default_address.address2,
        customer_default_address_ward: order?.customer?.default_address.ward,
        customer_default_address_district: order?.customer?.default_address.district,
        customer_default_address_province: order?.customer?.default_address.province
      }
    });
  }

  static async dequeueOrderQueue(batch, env) {
    const orderService = new OrderService(env);
    for (const message of batch.messages) {
      try {
        const data = message.body;
        await orderService.upsertHaravanOrder(data);
        const haravan_topic = data.haravan_topic;
        if (haravan_topic === HARAVAN_TOPIC.CREATED) {
          await orderService.invalidOrderNotification(data, env);
          await orderService.syncRefTransactions(data);
        }
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
