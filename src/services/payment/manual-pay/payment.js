import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { BadRequestException } from "src/exception/exceptions";

dayjs.extend(utc);

export default class ManualPaymentService {
  static PAGE_SIZE = 100;
  static INTERVAL_IN_MINUTES = 30;

  /**
   * Fetches records from the Lark Manual Payment table and upserts them into the
   * `manualPaymentTransaction` table in the database.
   *
   * @param {object} env - The environment configuration.
   */
  static async syncManualPaymentsToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = await LarksuiteService.createClientV2(env);
    const timeThreshold = dayjs().utc().subtract(ManualPaymentService.INTERVAL_IN_MINUTES, "minutes").subtract(5, "minutes").valueOf();
    const manualPaymentTable = TABLES.MANUAL_PAYMENT;

    if (!manualPaymentTable) {
      console.error("MANUAL_PAYMENT table configuration not found in constants.");
      return;
    }

    try {
      let hasMore = true;
      let pageToken = undefined;

      while (hasMore) {
        const response = await larkClient.bitable.appTableRecord.search({
          path: { app_token: manualPaymentTable.app_token, table_id: manualPaymentTable.table_id },
          params: {
            user_id_type: "user_id",
            page_token: pageToken,
            page_size: ManualPaymentService.PAGE_SIZE
          },
          data: {
            filter: {
              conjunction: "and",
              conditions: [
                { field_name: "Ngày Cập Nhật", operator: "isGreater", value: ["ExactDate", timeThreshold] },
                { field_name: "Loại Thanh Toán", operator: "isNot", value: ["QR"] }
              ]
            }
          }
        });

        if (response.code === 0 && response.data) {
          const currentRecordsPage = response.data.items ?? [];

          if (currentRecordsPage.length > 0) {
            const upsertPromises = currentRecordsPage.map(record => {
              const fields = record.fields;

              const getText = (field) => {
                if (typeof field === "string") return field;
                if (Array.isArray(field) && field.length > 0 && typeof field[0].text === "string") {
                  return field[0].text;
                }
                return null;
              };

              const rawOrderId = fields["ORDER ID"]?.value?.[0];

              const data = {
                payment_type: getText(fields["Loại Thanh Toán"]),
                branch: getText(fields["Chi Nhánh"]),
                shipping_code: fields["Mã Vận Đơn"],
                send_date: fields["Ngày Gửi"] ? dayjs.unix(fields["Ngày Gửi"] / 1000).utc().toDate() : null,
                receive_date: fields["Ngày Nhận Tiền"] ? dayjs.unix(fields["Ngày Nhận Tiền"] / 1000).utc().toDate() : null,
                created_date: fields["Ngày Tạo"] ? dayjs.unix(fields["Ngày Tạo"] / 1000).utc().toDate() : null,
                updated_date: fields["Ngày Cập Nhật"] ? dayjs.unix(fields["Ngày Cập Nhật"] / 1000).utc().toDate() : null,
                bank_account: fields["Số Tài Khoản"]?.value?.[0]?.toString() ?? null,
                bank_name: getText(fields["Ngân Hàng"]?.value),
                transfer_amount: fields["Số Tiền Giao Dịch"],
                transfer_note: Array.isArray(fields["Nội Dung CK"]) ? fields["Nội Dung CK"].map(i => i.text || "").join("") : fields["Nội Dung CK"],
                haravan_order_id: rawOrderId != null ? Int(rawOrderId) : null,
                haravan_order_name: getText(fields["ORDER"]),
                transfer_status: getText(fields["Trạng Thái Thủ Công"])
              };

              return db.manualPaymentTransaction.upsert({
                where: { lark_record_id: record.record_id },
                create: { ...data, lark_record_id: record.record_id, misa_synced: false },
                update: data
              });
            });

            try {
              await db.$transaction(upsertPromises);
            } catch (error) {
              console.error("Error during bulk upsert of manual payments for current page:", error);
            }
          }
          hasMore = response.data.has_more;
          pageToken = response.data.page_token;
        } else {
          console.error(`Error fetching page from Lark Bitable: ${response.msg} (code: ${response.code})`);
          hasMore = false;
        }
      }
    } catch (error) {
      console.error("Error fetching records from manual payment table:", error);
      return;
    }
  }

  /**
   * Creates a single manual payment transaction in the database.
   * @param {object} env - The environment configuration.
   * @param {object} data - The data for the new payment transaction, matching the Prisma model.
   * @returns {Promise<object|null>} The created payment transaction or null on error.
   */
  static async createManualPayment(env, data) {
    const db = Database.instance(env);
    try {
      const newPayment = await db.manualPaymentTransaction.upsert({
        where: {
          lark_record_id: data.lark_record_id
        },
        update: data,
        create: {
          ...data,
          misa_synced: data.misa_synced ?? false
        }
      });
      return newPayment;
    } catch (error) {
      console.error("Error creating manual payment transaction:", error);
      return null;
    }
  }

  /**
   * Updates a single manual payment transaction in the database by its UUID.
   * @param {object} env - The environment configuration.
   * @param {string} uuid - The UUID of the payment transaction to update.
   * @param {object} data - The data to update.
   * @returns {Promise<object|null>} The updated payment transaction or null on error.
   */
  static async updateManualPayment(env, uuid, data) {
    const db = Database.instance(env);
    try {

      const paymentBeforeUpdate = await db.manualPaymentTransaction.findUnique({
        where: { uuid }
      });

      if (!paymentBeforeUpdate) {
        return null;
      }

      if (paymentBeforeUpdate.transfer_status === "Xác nhận") {
        const updateData = { ...data };

        delete updateData.transfer_status;
        delete updateData.transfer_amount;
        delete updateData.haravan_order_id;
        delete updateData.haravan_order_number;

        return db.manualPaymentTransaction.update({
          where: { uuid: uuid },
          data: updateData
        });
      }

      const dataForFirstUpdate = {
        ...data
      };

      delete dataForFirstUpdate.transfer_status;

      // Update other fields
      const updatedPayment = await db.manualPaymentTransaction.update({
        where: { uuid: uuid },
        data: dataForFirstUpdate
      });

      const shouldCreateTransaction =
      data.transfer_status === "Xác nhận" &&
      paymentBeforeUpdate.transfer_status !== "Xác nhận";

      if (shouldCreateTransaction) {
        if (updatedPayment.haravan_order_name === "Đơn hàng cọc") {
          throw new BadRequestException("Deposit order cannot be mapped!");
        }

        await ManualPaymentService.createManualTransactionsToHaravanOrder(
          env,
          db,
          updatedPayment.haravan_order_id,
          updatedPayment.transfer_amount,
          updatedPayment.payment_type
        );
        const finalUpdatedPayment = await db.manualPaymentTransaction.update({
          where: { uuid: uuid },
          data: {
            transfer_status: data.transfer_status
          }
        });

        return finalUpdatedPayment;
      }

      return updatedPayment;
    } catch (error) {
      console.error(`Error during update or Haravan transaction creation for UUID ${uuid}:`, error.message);
      throw error;
    }
  }

  static async createManualTransactionsToHaravanOrder(
    env,
    db,
    haravanOrderId,
    transferAmount,
    paymentType
  ) {

    if (!haravanOrderId) {
      throw new BadRequestException("Haravan Order ID is missing.");
    }

    if (!transferAmount) {
      throw new BadRequestException("Transaction is missing.");
    }

    const parsedTransferAmount = parseInt(transferAmount);

    if (parsedTransferAmount <= 0) {
      throw new BadRequestException("Transaction amount must be a positive number.");
    }

    const validPaymentMethods = ["Tiền Mặt", "Cà Thẻ Tại Cửa Hàng", "Cà Thẻ Online", "COD HTC"];
    if (!paymentType || !validPaymentMethods.includes(paymentType)) {
      throw new BadRequestException(`Invalid payment method. Must be one of: ${validPaymentMethods.join(", ")}`);
    }

    const orderResult = await db.$queryRaw`
      SELECT id, cancelled_status, financial_status, closed_status, total_price
      FROM haravan.orders
      WHERE id = ${haravanOrderId}
    `;
    const order = orderResult[0];

    if (!order) {
      throw new BadRequestException(`Order with ID ${haravanOrderId} not found.`);
    }
    if (order.cancelled_status === "cancelled") throw new BadRequestException("Order is cancelled.");
    if (order.financial_status === "paid") throw new BadRequestException("Order is already paid.");
    if (order.financial_status === "refunded") throw new BadRequestException("Order is already refunded.");
    if (order.closed_status === "closed") throw new BadRequestException("Order is closed.");
    if (parsedTransferAmount > parseInt(order.total_price)) {
      throw new BadRequestException("Transaction amount exceeds order total price.");
    }

    const HRV_API_KEY = await env.HARAVAN_TOKEN_SECRET.get();
    const HARAVAN_API_BASE_URL = env.HARAVAN_API_BASE_URL;

    if (!HARAVAN_API_BASE_URL || !HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const apiUrl = `${HARAVAN_API_BASE_URL}/com/orders/${haravanOrderId}/transactions.json`;

    const transactionPayload = {
      transaction: {
        amount: parsedTransferAmount,
        kind: "capture",
        gateway: paymentType
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HRV_API_KEY}`
      },
      body: JSON.stringify(transactionPayload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new BadRequestException(`Failed to create Haravan transaction. Status: ${response.status}, Body: ${errorBody}`);
    }

    const responseData = await response.json();
    return responseData.transaction;
  }
}
