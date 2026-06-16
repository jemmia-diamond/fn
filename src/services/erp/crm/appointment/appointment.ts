import RecordService from "services/larksuite/docs/base/record/record";
import { APPOINTMENTS } from "services/larksuite/appointment/constant";
import FrappeClient from "src/frappe/frappe-client";

export interface IERPNextAppointment {
  name: string;
  owner: string;
  modified_by: string;
  record_id?: string | null;
  gender?: string | null;
  scheduled_time?: string | null;
  store?: string | null;
  customer_name?: string | null;
  customer_phone_number?: string | null;
  notes?: string | null;
  conversation_greeting?: string | null;
  customer_response?: string | null;
  status?: string | null;
  policy?: string | null;
}

export interface Env {
  ERPNEXT_BOT_EMAIL?: string;
  FN_KV: any; // Cloudflare KV Namespace
  JEMMIA_ERP_BASE_URL: string;
  JEMMIA_ERP_API_KEY: string;
  JEMMIA_ERP_API_SECRET: string;
}

export default class ERPNextCRMAppointmentService {

  static async syncAppointment(payload: IERPNextAppointment, env: Env): Promise<void> {
    try {

      const botEmail = env.ERPNEXT_BOT_EMAIL || "tech@jemmia.vn";

      // 1. Block sync if the name lock exists (prevents duplicate calls for the same appointment ID)
      const nameLockKey = `lock:appointment-synced:${payload.name}`;
      if (env.FN_KV) {
        const isSynced = await env.FN_KV.get(nameLockKey);
        if (isSynced) {
          return;
        }
      }

      // KV expiration TTL must be at least 60 seconds
      const lockKey = payload.record_id ? `lock:appointment:${payload.record_id}` : null;
      if (lockKey && env.FN_KV) {
        const isLocked = await env.FN_KV.get(lockKey);
        if (isLocked) {
          return;
        }
        await env.FN_KV.put(lockKey, "true", { expirationTtl: 60 });
      }

      if (payload.modified_by === botEmail || payload.owner === botEmail) {
        if (env.FN_KV && lockKey) await env.FN_KV.delete(lockKey);
        return;
      }

      // Map gender to Lark Base
      const genderMap: Record<string, string> = {
        "Male": "Nam",
        "Female": "Nữ",
        "Other": "LGBT"
      };
      const gender = genderMap[payload.gender || ""] || payload.gender || "";

      const scheduledTime = payload.scheduled_time
        ? new Date(payload.scheduled_time).getTime()
        : null;

      // Map fields for Lark Base
      const fields: Record<string, any> = {
        "Appointment Name": payload.name, // Sync ERP name to Lark Column
        "Cửa hàng": payload.store ? [payload.store] : [],
        "Tên khách hàng/ facebook": payload.customer_name || "",
        "Giới tính": gender,
        "Lưu ý đặc biệt": payload.notes || "",
        "Nội dung đón tiếp tại cửa hàng": payload.conversation_greeting || "",
        "Offlie Phản hồi": payload.customer_response || "",
        "Trạng thái đơn hàng": payload.status || "Khách hẹn đến cửa hàng",
        "Chính sách thu mua thu đổi": payload.policy || ""
      };

      if (payload.customer_phone_number && payload.customer_phone_number.trim() !== "") {
        fields["Số điện thoại"] = payload.customer_phone_number.trim();
      }

      if (scheduledTime) {
        fields["Ngày khách dự kiến tới CH"] = scheduledTime;
      }

      if (payload.record_id) {
        // Update existing record

        // Data diff check
        try {
          // @ts-expect-error
          const currentLarkRecord = await RecordService.getLarksuiteRecord({
            env,
            appToken: APPOINTMENTS.APP_TOKEN,
            tableId: APPOINTMENTS.TABLE_ID,
            recordId: payload.record_id,
            userIdType: "open_id"
          });

          if (currentLarkRecord) {
            const currentFields = currentLarkRecord.fields || {};
            const currentScheduledTime = currentFields["Ngày khách dự kiến tới CH"]
              ? new Date(currentFields["Ngày khách dự kiến tới CH"]).getTime()
              : null;

            const isSame =
              JSON.stringify(currentFields["Cửa hàng"] || []) === JSON.stringify(fields["Cửa hàng"]) &&
              (currentFields["Tên khách hàng/ facebook"] || "") === fields["Tên khách hàng/ facebook"] &&
              (currentFields["Số điện thoại"] || "") === fields["Số điện thoại"] &&
              (currentFields["Giới tính"] || "") === fields["Giới tính"] &&
              (currentFields["Lưu ý đặc biệt"] || "") === fields["Lưu ý đặc biệt"] &&
              currentScheduledTime === fields["Ngày khách dự kiến tới CH"] &&
              (currentFields["Nội dung đón tiếp tại cửa hàng"] || "") === fields["Nội dung đón tiếp tại cửa hàng"] &&
              (currentFields["Offlie Phản hồi"] || "") === fields["Offlie Phản hồi"] &&
              (currentFields["Trạng thái đơn hàng"] || "") === fields["Trạng thái đơn hàng"] &&
              (currentFields["Chính sách thu mua thu đổi"] || "") === fields["Chính sách thu mua thu đổi"];

            if (isSame) {
              if (env.FN_KV && lockKey) await env.FN_KV.delete(lockKey);
              return;
            }
          }
        } catch (error) {
          console.warn(`[ERP-SYNC] Data Diff Check failed, continuing updates fallback:`, error);
        }

        // @ts-expect-error
        await RecordService.updateLarksuiteRecord({
          env,
          appToken: APPOINTMENTS.APP_TOKEN,
          tableId: APPOINTMENTS.TABLE_ID,
          recordId: payload.record_id,
          fields,
          userIdType: "open_id"
        });

      } else {
        // 1. Check whether record already exists on Lark with the corresponding Appointment Name (avoid duplicate creation when retrying)
        let existingRecordId: string | null = null;
        try {
          const existingRecords = await RecordService.fetchRecords(
            env,
            { app_token: APPOINTMENTS.APP_TOKEN, table_id: APPOINTMENTS.TABLE_ID },
            {
              filter: {
                conjunction: "and",
                conditions: [
                  {
                    field_name: "Appointment Name",
                    operator: "is",
                    value: [payload.name]
                  }
                ]
              },
              userIdType: "open_id",
              pageSize: 1,
              sort: null
            }
          );

          if (existingRecords && existingRecords.length > 0) {
            existingRecordId = existingRecords[0].record_id;
          }
        } catch (searchError) {
          console.warn(`[ERP-SYNC] Failed to search existing Lark record for ${payload.name}:`, searchError);
        }

        if (existingRecordId) {
          // 2. If exists, sync
          // @ts-expect-error
          await RecordService.updateLarksuiteRecord({
            env,
            appToken: APPOINTMENTS.APP_TOKEN,
            tableId: APPOINTMENTS.TABLE_ID,
            recordId: existingRecordId,
            fields,
            userIdType: "open_id"
          });

          if (env.FN_KV) {
            await env.FN_KV.put(nameLockKey, "true", { expirationTtl: 60 });
            await env.FN_KV.put(`lock:appointment:${existingRecordId}`, "true", { expirationTtl: 60 });
          }

          // @ts-expect-error
          const frappeClient = new FrappeClient({
            url: env.JEMMIA_ERP_BASE_URL,
            apiKey: env.JEMMIA_ERP_API_KEY,
            apiSecret: env.JEMMIA_ERP_API_SECRET
          });

          await frappeClient.update({
            doctype: "Appointment",
            name: payload.name,
            record_id: existingRecordId
          });

        } else {
          // 3. If not existing, create new record
          // @ts-expect-error
          const newRecord = await RecordService.createLarksuiteRecord({
            env,
            appToken: APPOINTMENTS.APP_TOKEN,
            tableId: APPOINTMENTS.TABLE_ID,
            fields,
            userIdType: "open_id"
          });

          if (newRecord && newRecord.record_id) {
            const newRecordId = newRecord.record_id;

            // 2. Lock both name and record_id to prevent webhook feedback loop
            if (env.FN_KV) {
              await env.FN_KV.put(nameLockKey, "true", { expirationTtl: 60 });
              await env.FN_KV.put(`lock:appointment:${newRecordId}`, "true", { expirationTtl: 60 });
            }

            // @ts-expect-error
            const frappeClient = new FrappeClient({
              url: env.JEMMIA_ERP_BASE_URL,
              apiKey: env.JEMMIA_ERP_API_KEY,
              apiSecret: env.JEMMIA_ERP_API_SECRET
            });

            await frappeClient.update({
              doctype: "Appointment",
              name: payload.name,
              record_id: newRecordId
            });

          } else {
            throw new Error("Larkbase record creation failed or did not return record_id");
          }
        }
      }

    } catch (error) {
      // Release locks on error
      if (env.FN_KV) {
        if (payload.record_id) await env.FN_KV.delete(`lock:appointment:${payload.record_id}`);
        await env.FN_KV.delete(`lock:appointment-synced:${payload.name}`);
      }
      throw error;
    }
  }
}

