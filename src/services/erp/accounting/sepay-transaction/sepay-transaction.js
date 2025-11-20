import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import OrderTransactionClient from "services/haravan/api-client/modules/order-transactions/order-transaction-client";
import { TABLES } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";

dayjs.extend(utc);

export default class SepayTransactionService {
  constructor(env) {
    this.env = env;

    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });

    this.db = Database.instance(env);
  }

  async processTransaction(sepayTransaction) {
    const { content, transferAmount } = sepayTransaction;

    const pattern = /(?:SEVQR\s+)?(ORDER\w+(?:\s+\d+)?|ORDERLATER(?:\s+\d+)?)/;
    const match = content.match(pattern);
    if (!match) throw new Error("Order description not found");

    const orderDesc = match[0];
    const parts = orderDesc.split(" ");

    const orderNumber =
      parts[0] === "SEVQR"
        ? parts[1]
        : parts[0];

    const isOrderLater = orderNumber === "ORDERLATER";

    const qr = await this.findQrRecord({
      orderNumber,
      orderDesc,
      transferAmount
    });

    if (!qr) throw new Error("QR code not found");

    if (!isOrderLater) {
      const transactionClient = new OrderTransactionClient(this.env);

      const created = await transactionClient.createTransaction(
        qr.haravan_order_id,
        {
          amount: transferAmount,
          kind: "capture",
          gateway: "Chuyển khoản ngân hàng (tự động xác nhận giao dịch)"
        }
      );

      if (!created) {
        throw new Error("Failed to create Haravan transaction");
      }
    }

    await this.db.qrPaymentTransaction.update({
      where: { id: qr.id },
      data: { transfer_status: "success" }
    });

    if (qr.payment_entry_name) {
      await this.frappeClient.upsert(
        {
          doctype: "Payment Entry",
          name: qr.payment_entry_name,
          custom_transfer_status: "success"
        },
        "name"
      );
    }

    if (qr.lark_record_id) {
      const fieldsToUpdate = {
        ["Trạng thái chuyển khoản"]: "Đã hoàn thành"
      };
      await RecordService.updateLarksuiteRecord({
        env: this.env,
        appToken: TABLES.QR_PAYMENT.app_token,
        tableId: TABLES.QR_PAYMENT.table_id,
        recordId: qr.lark_record_id,
        fields: fieldsToUpdate,
        userIdType: "open_id"
      });
    }
    return true;
  }

  async findQrRecord({ orderNumber, orderDesc, transferAmount }) {
    return this.db.qrPaymentTransaction.findFirst({
      where: {
        haravan_order_number: orderNumber,
        transfer_note: orderDesc,
        transfer_amount: transferAmount,
        transfer_status: "pending",
        is_deleted: false
      }
    });
  }

  static async dequeueSepayTransactionQueue(batch, env) {
    const service = new SepayTransactionService(env);

    for (const message of batch.messages) {
      try {
        await service.processTransaction(message.body);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
