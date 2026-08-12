import RecordService from "services/larksuite/docs/base/record/record";
import { APPOINTMENTS } from "services/larksuite/appointment/constant";
import FrappeClient from "src/frappe/frappe-client";
import AppointmentNotificationService from "services/erp/crm/appointment/appointment-notification";

const DEFAULT_USER = "tech@jemmia.vn";
const IGNORED_SALES = ["SALES-PERSON-15761", "SALES-PERSON-15562"];
const FIRST_ITEM = 0;
export default class ERPNextCRMAppointmentService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({ env });
    this.notificationService = new AppointmentNotificationService(env);
  }

  async syncAppointment(payload, event) {
    if (IGNORED_SALES.includes(payload?.primary_sales)) return;
    const fields = await this.mapPayloadToLarkFields(payload);
    if (event === "create" || !payload.record_id) {
      return await this.createAppointment(payload, fields);
    }

    await this.updateAppointment(payload, fields);
  }

  async createAppointment(payload, fields) {
    const existingRecordId = await this.getExistingLarkRecordId(payload);
    if (existingRecordId) {
      payload.record_id = existingRecordId;
      await this.updateAppointment(payload, fields);
      await this.frappeClient.update({
        doctype: "Appointment",
        name: payload.name,
        record_id: existingRecordId,
        performed_by: DEFAULT_USER
      });
      return;
    }

    const newRecord = await RecordService.createLarksuiteRecord({
      env: this.env,
      appToken: APPOINTMENTS.APP_TOKEN,
      tableId: APPOINTMENTS.TABLE_ID,
      fields, userIdType: "open_id"
    });
    if (!newRecord) return;

    payload.record_id = newRecord.record_id;
    const message_id = await this.notificationService.sendNewAppointmentMessage(payload, fields);
    if (message_id) {
      await RecordService.updateLarksuiteRecord({
        env: this.env,
        appToken: APPOINTMENTS.APP_TOKEN,
        tableId: APPOINTMENTS.TABLE_ID,
        recordId: newRecord.record_id,
        fields: { message_id },
        userIdType: "open_id"
      });
    }

    await this.frappeClient.update({
      doctype: "Appointment",
      name: payload.name,
      record_id: newRecord.record_id,
      message_id,
      performed_by: DEFAULT_USER
    });
  }

  async updateAppointment(payload, fields) {
    let message_id = payload.message_id;
    let existingFields = null;

    if (payload.record_id) {
      existingFields = await this.getExistingBaseRecordFields(payload.record_id);
      if (!message_id && existingFields) {
        message_id = existingFields.message_id;
      }
    }

    if (!message_id) {
      message_id = await this.notificationService.sendNewAppointmentMessage(payload, fields);
      await this.frappeClient.update({
        doctype: "Appointment",
        name: payload.name,
        performed_by: DEFAULT_USER,
        message_id
      });
    } else {
      const shouldReply = this.notificationService.shouldSendThreadReply(existingFields, fields);
      if (shouldReply) await this.notificationService.sendThreadReply(message_id, payload, existingFields);
    }

    if (message_id) fields["message_id"] = message_id;
    await RecordService.updateLarksuiteRecord({
      env: this.env,
      appToken: APPOINTMENTS.APP_TOKEN,
      tableId: APPOINTMENTS.TABLE_ID,
      recordId: payload.record_id,
      fields, userIdType: "open_id"
    });
  }

  async getExistingBaseRecordFields(recordId) {
    const record = await RecordService.getLarksuiteRecord({
      env: this.env,
      appToken: APPOINTMENTS.APP_TOKEN,
      tableId: APPOINTMENTS.TABLE_ID,
      recordId, userIdType: "open_id"
    });
    return record?.fields || null;
  }

  stripHtml(html) {
    if (!html) return "";
    return String(html).replace(/<\/p>|<br\s*\/?>/gi, "\n").replace(/<[^>]*>?/gm, "").trim();
  }

  async mapPayloadToLarkFields(payload) {
    const policies = (payload?.policies || [])
      .map(p => p.title).filter(Boolean).join("\n");
    const notesText = this.stripHtml(payload?.notes);
    const offlineText = this.stripHtml(payload?.offline_response);

    const mainSalesEmails = (payload?.main_sales || []).map(s => s.employee_email).filter(Boolean);
    const mainSalesIds = await this.notificationService.getLarkUserIdsByEmails(mainSalesEmails);
    const offlineSalesEmails = (payload?.offline_sales || []).map(s => s.employee_email).filter(Boolean);
    const offlineSalesIds = await this.notificationService.getLarkUserIdsByEmails(offlineSalesEmails);

    const fields = {
      "Người tạo": mainSalesIds?.length ? mainSalesIds : null,
      "Sales hỗ trợ": offlineSalesIds?.length ? offlineSalesIds : null,
      "Ngày đến dự kiến": payload.scheduled_time ? new Date(payload.scheduled_time).getTime() : null,
      "Cửa hàng": payload?.store,
      "Khách hàng": payload.customer_name,
      "Giới tính": payload.gender,
      "Offlie Phản hồi": offlineText,
      "Trạng thái đơn hàng": payload.order_status || "Khách hẹn đến cửa hàng",
      "Trạng thái": payload?.status,
      "Số điện thoại": payload.customer_phone_number,
      "Chính sách thu mua thu đổi": policies,
      "Nội dung đón tiếp": notesText,
      "Khoảng ngân sách": payload.range_estimated_budget,
      "Ngân sách ước tính": payload.budget,
      "Mục đích cuộc hẹn": payload.appointment_reason,
      "Nguồn": payload.source,
      "appointment_name": payload.name
    };

    return fields;
  }

  async getExistingLarkRecordId(payload) {
    const existingRecords = await RecordService.fetchRecords(
      this.env,
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
    return existingRecords?.[FIRST_ITEM]?.record_id ?? null;
  }
}
