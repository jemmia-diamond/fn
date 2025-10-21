import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import { TABLES } from "services/larksuite/docs/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class PaymentService {
  /**
   * Fetches records from the Lark Manual Payment table and upserts them into the
   * `manualPaymentTransaction` table in the database.
   *
   * @param {object} env - The environment configuration.
   */
  static async syncManualPaymentsToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = await LarksuiteService.createClientV2(env);
    const timeThreshold = dayjs().utc().subtract(1, "day").subtract(5, "minutes").valueOf(); // Re-introducing the time threshold
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
            page_size: 100
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
                haravan_order_id: fields["ORDER ID"]?.value?.[0]?.toString() ?? null,
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
}
