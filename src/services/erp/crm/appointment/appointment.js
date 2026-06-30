import RecordService from "services/larksuite/docs/base/record/record";
import { APPOINTMENTS } from "services/larksuite/appointment/constant";
import FrappeClient from "src/frappe/frappe-client";
import Database from "services/database";

export default class ERPNextCRMAppointmentService {

  static async syncAppointment(payload, event, env) {
    const fields = await this.mapPayloadToLarkFields(payload, env);
    if (event === "create") return await this.createAppointment(payload, fields, env);

    await this.updateAppointment(payload, fields, env);
  }

  static async createAppointment(payload, fields, env) {
    const existingRecordId = await this.getExistingLarkRecordId(payload, env);
    const frappeClient = this.getFrappeClient(env);
    if (existingRecordId) {
      payload.record_id = existingRecordId;
      await this.updateAppointment(payload, fields, env);
      await frappeClient.update({
        doctype: "Appointment",
        name: payload.name,
        record_id: existingRecordId
      });
    } else {
      const newRecord = await RecordService.createLarksuiteRecord({
        env,
        appToken: APPOINTMENTS.APP_TOKEN,
        tableId: APPOINTMENTS.TABLE_ID,
        fields,
        userIdType: "open_id"
      });

      await frappeClient.update({
        doctype: "Appointment",
        name: payload.name,
        record_id: newRecord.record_id
      });
    }
  }

  static async updateAppointment(payload, fields, env) {
    await RecordService.updateLarksuiteRecord({
      env,
      appToken: APPOINTMENTS.APP_TOKEN,
      tableId: APPOINTMENTS.TABLE_ID,
      recordId: payload.record_id,
      fields,
      userIdType: "open_id"
    });
  }

  static async getExistingLarkRecordId(payload, env) {
    const existingRecords = await RecordService.fetchRecords(
      env,
      { app_token: APPOINTMENTS.APP_TOKEN, table_id: APPOINTMENTS.TABLE_ID },
      {
        filter: {
          conjunction: "and",
          conditions: [
            {
              field_name: "appointment_name",
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
      return existingRecords[0].record_id;
    }
    return null;
  }

  static getFrappeClient(env) {
    return new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  static stripHtml(html) {
    if (!html) return "";
    return String(html).replace(/<\/p>|<br\s*\/?>/gi, "\n").replace(/<[^>]*>?/gm, "").trim();
  }

  static async getLarkUserIdsByEmails(db, emails) {
    if (!emails || emails.length === 0 || !db) return [];
    const users = await db.larksuite_users.findMany({
      where: { enterprise_email: { in: emails } },
      select: { open_id: true }
    });
    return users.filter(u => u.open_id).map(u => ({ id: u.open_id }));
  }

  static async mapPayloadToLarkFields(payload, env) {
    const genderMap = {
      "Male": "Nam",
      "Female": "Nữ",
      "Other": "LGBT"
    };
    const gender = genderMap[payload?.gender];
    const policies = (payload?.policies || [])
      .map(p => p.title).filter(Boolean).join("\n");
    const notesText = this.stripHtml(payload?.notes);
    const offlineText = this.stripHtml(payload?.offline_response);
    const db = env ? Database.instance(env) : null;

    const mainSalesEmails = (payload?.main_sales || []).map(s => s.employee_email).filter(Boolean);
    const mainSalesIds = await this.getLarkUserIdsByEmails(db, mainSalesEmails);
    const offlineSalesEmails = (payload?.offline_sales || []).map(s => s.employee_email).filter(Boolean);
    const offlineSalesIds = await this.getLarkUserIdsByEmails(db, offlineSalesEmails);

    const fields = {
      "Sale chính": mainSalesIds.length > 0 ? mainSalesIds : null,
      "Sale Offline tiếp nhận": offlineSalesIds.length > 0 ? offlineSalesIds : null,
      "Ngày khách dự kiến tới CH": payload.scheduled_time ? new Date(payload.scheduled_time).getTime() : null,
      "Cửa hàng": payload?.store ? [payload.store] : [],
      "Tên khách hàng/ facebook": payload.customer_name,
      "Giới tính": gender,
      "Offlie Phản hồi": offlineText,
      "Trạng thái đơn hàng": payload.order_status || "Khách hẹn đến cửa hàng",
      "Số điện thoại": payload.customer_phone_number,
      "Chính sách thu mua thu đổi": policies,
      "Notes": notesText,

      "Khoảng ngân sách": payload.range_estimated_budget,
      "Ngân Sách Uớc Tính": payload.budget,
      "at_store": payload.at_store,
      "policies": policies,
      "Mục đích cuộc hẹn": payload.appointment_reason,
      "source": payload.source,
      "appointment_name": payload.name
    };

    return fields;
  }
}
