import * as Sentry from "@sentry/cloudflare";
import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { BadRequestException } from "src/exception/exceptions";
import HaravanAPI from "services/clients/haravan-client";
import Misa from "services/misa";

dayjs.extend(utc);

export default class ManualPaymentService {
  static PAGE_SIZE = 100;
  static INTERVAL_IN_MINUTES = 30;

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Fetches records from the Lark Manual Payment table and upserts them into the
   * `manualPaymentTransaction` table in the database.
   */
  async syncManualPaymentsToDatabase() {
    const larkClient = await LarksuiteService.createClientV2(this.env);
    const timeThreshold = dayjs().utc().subtract(ManualPaymentService.INTERVAL_IN_MINUTES, "minutes").subtract(5, "minutes").valueOf();
    const manualPaymentTable = TABLES.MANUAL_PAYMENT;

    if (!manualPaymentTable) {
      Sentry.captureException(new Error("MANUAL_PAYMENT table configuration not found in constants."));
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
                haravan_order_id: rawOrderId != null ? parseInt(rawOrderId, 10) : null,
                haravan_order_name: getText(fields["ORDER"]),
                transfer_status: getText(fields["Trạng Thái Thủ Công"])
              };

              return this.db.manualPaymentTransaction.upsert({
                where: { lark_record_id: record.record_id },
                create: { ...data, lark_record_id: record.record_id, misa_synced: false },
                update: data
              });
            });

            try {
              await this.db.$transaction(upsertPromises);
            } catch (error) {
              Sentry.captureException(error);
            }
          }
          hasMore = response.data.has_more;
          pageToken = response.data.page_token;
        } else {
          Sentry.captureException(new Error(`Error fetching page from Lark Bitable: ${response.msg} (code: ${response.code})`));
          hasMore = false;
        }
      }
    } catch (error) {
      Sentry.captureException(error);
      return;
    }
  }

  /**
   * Creates a single manual payment transaction in the database.
   * Supports both legacy Larkbase (lark_record_id) and new ERPNext (payment_entry_name) identifiers.
   * @param {object} data - The data for the new payment transaction, matching the Prisma model.
   * @returns {Promise<object|null>} The created payment transaction or null on error.
   */
  async createManualPayment(data) {
    try {
      let whereClause;
      if (data.payment_entry_name) {
        whereClause = { payment_entry_name: data.payment_entry_name };
      } else {
        whereClause = { lark_record_id: data.lark_record_id };
      }

      const newPayment = await this.db.manualPaymentTransaction.upsert({
        where: whereClause,
        update: data,
        create: {
          ...data,
          misa_synced: data.misa_synced ?? false
        }
      });

      // Temporary for larkbase usage, we'll remove this block once we're all move over to erp
      if (newPayment.transfer_status === "Xác nhận" && newPayment.receive_date && newPayment.haravan_order_id && !newPayment.payment_entry_name) {
        await this._enqueueMisaBackgroundJob(newPayment);
      }

      return newPayment;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  /**
   * Updates a single manual payment transaction in the database by its UUID.
   * @param {string} uuid - The UUID of the payment transaction to update.
   * @param {object} data - The data to update.
   * @returns {Promise<object|null>} The updated payment transaction or null on error.
   */
  async updateManualPayment(uuid, data) {
    try {

      const paymentBeforeUpdate = await this.db.manualPaymentTransaction.findUnique({
        where: { uuid }
      });

      if (!paymentBeforeUpdate) {
        return null;
      }

      if (paymentBeforeUpdate.transfer_status === "Xác nhận" && !data.payment_entry_name) {
        const updateData = { ...data };

        delete updateData.transfer_status;
        delete updateData.transfer_amount;
        delete updateData.haravan_order_id;
        delete updateData.haravan_order_number;

        const updatedPayment = await this.db.manualPaymentTransaction.update({
          where: { uuid: uuid },
          data: updateData
        });

        // Temporary for larkbase usage, we'll remove this block once we're all move over to erp
        if (data.receive_date && !paymentBeforeUpdate.receive_date && updatedPayment.haravan_order_id && !updatedPayment.payment_entry_name) {
          await this._enqueueMisaBackgroundJob(updatedPayment);
        }

        return updatedPayment;
      }

      const dataForFirstUpdate = {
        ...data
      };

      delete dataForFirstUpdate.transfer_status;

      const isOrderLater = dataForFirstUpdate.haravan_order_name === "Đơn hàng cọc";
      if (!isOrderLater && !data.payment_entry_name) {
        const orderExists = await this.db.order.findUnique({
          where: { id: dataForFirstUpdate.haravan_order_id }
        });
        if (!orderExists) {
          throw new BadRequestException(`Haravan Order ID ${dataForFirstUpdate.haravan_order_id} does not exist.`);
        }
      }

      if (isOrderLater && !data.payment_entry_name) {
        delete dataForFirstUpdate.haravan_order_id;
      }

      // Update other fields
      const updatedPayment = await this.db.manualPaymentTransaction.update({
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

        await this.createManualTransactionsToHaravanOrder(
          updatedPayment.haravan_order_id,
          updatedPayment.transfer_amount,
          updatedPayment.payment_type
        );
        const finalUpdatedPayment = await this.db.manualPaymentTransaction.update({
          where: { uuid: uuid },
          data: {
            transfer_status: data.transfer_status
          }
        });

        // Temporary for larkbase usage, we'll remove this block once we're all move over to erp
        if (finalUpdatedPayment.receive_date && finalUpdatedPayment.haravan_order_id && !finalUpdatedPayment.payment_entry_name) {
          await this._enqueueMisaBackgroundJob(finalUpdatedPayment);
        }

        return finalUpdatedPayment;
      }

      return updatedPayment;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async _enqueueMisaBackgroundJob(manualPayment) {
    const payload = {
      job_type: Misa.Constants.JOB_TYPE.CREATE_MANUAL_VOUCHER,
      data: {
        manual_payment_uuid: manualPayment.uuid
      }
    };

    await this.env["MISA_QUEUE"].send(payload, { delaySeconds: Misa.Constants.DELAYS.ONE_MINUTE });
  }

  async createManualTransactionsToHaravanOrder(
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

    const orderResult = await this.db.$queryRaw`
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

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const hrvClient = new HaravanAPI(HRV_API_KEY);

    const responseData = await hrvClient.orderTransaction.createTransaction(
      haravanOrderId,
      {
        amount: parsedTransferAmount,
        kind: "capture",
        gateway: paymentType
      }
    );
    return responseData.transaction;
  }
}
