import RecordService from "services/larksuite/docs/base/record/record";
import {
  LarksuiteAppointmentRawFields,
  LarksuiteAppointmentParsedFields,
  IFrappeLead,
  ILarksuiteAppointment,
  LarksuiteAttachment
} from "src/services/larksuite/appointment/types";
import { PrismaClient } from "@prisma-cli";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import LarksuiteService from "src/services/larksuite/lark";
import { fetchLeadInfoByPhoneNumber } from "frappe/lead";
import { mapLarkToFrappe } from "frappe/utils/utils-lark";
import { saveAppointmentToPrismaDb } from "services/larksuite/appointment/appointment-save";
import { getDocumentAttachments, removeFileAttachment } from "frappe/attachment";
import { APPOINTMENTS } from "services/larksuite/appointment/constant";
export default class AppointmentService {
  env: any;
  db: PrismaClient;
  appToken: string;
  tableId: string;
  frappeClient: FrappeClient;

  private static _instance: AppointmentService;

  public static instance(env: any): AppointmentService {
    if (!this._instance) {
      this._instance = new AppointmentService(env);
    } else {
      this._instance.env = env;
    }
    return this._instance;
  }

  private constructor(env: any) {
    this.env = env;
    this.db = Database.instance(env);
    // @ts-expect-error This FrappeClient was written in javascript so we can not define the type for it
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.appToken = APPOINTMENTS.APP_TOKEN;
    this.tableId = APPOINTMENTS.TABLE_ID;
  }

  private async syncLarkRecord(
    recordId: string
  ): Promise<ILarksuiteAppointment> {
    // @ts-expect-error This RecordService was written in javascript so we can not define the type for it
    const record = await RecordService.getLarksuiteRecord({
      env: this.env,
      appToken: this.appToken,
      tableId: this.tableId,
      recordId
    });

    if (!record) {
      throw new Error("Lark record not found");
    }

    const rawFields = (record.fields || {}) as LarksuiteAppointmentRawFields;
    const fields: LarksuiteAppointmentParsedFields = {
      appointment_name: rawFields["Appointment Name"] || "",
      store: rawFields["Cửa hàng"]?.[0] || "",
      name: rawFields["Tên khách hàng/ facebook"] || "",
      phone_number: rawFields["Số điện thoại"] || "",
      gender: rawFields["Giới tính"] || "",
      product_images: rawFields["Hình ảnh sản phẩm (nếu có)"],
      note: rawFields["Lưu ý đặc biệt"],
      date_time: rawFields["Ngày khách dự kiến tới CH"]
        ? new Date(rawFields["Ngày khách dự kiến tới CH"])
        : null,
      conversation_greeting: rawFields["Nội dung đón tiếp tại cửa hàng"],
      customer_response: rawFields["Offlie Phản hồi"],
      main_sales: rawFields["Sale chính"],
      offline_sales: rawFields["Sale Offline tiếp nhận"],
      status: rawFields["Trạng thái đơn hàng"],
      policy: rawFields["Chính sách thu mua thu đổi"]
    };

    const data: ILarksuiteAppointment = {
      record_id: recordId,
      ...fields,
      product_images: fields.product_images ? fields.product_images : null,
      main_sales: fields.main_sales ? fields.main_sales : null,
      offline_sales: fields.offline_sales ? fields.offline_sales : null
    };

    return data;
  }

  private async downloadFileAndUploadFrappe(
    attachments: LarksuiteAttachment[],
    docname: string
  ) {
    try {
      if (!attachments?.length) return;
      const accessToken = await LarksuiteService.getTenantAccessToken(this.env);
      const results = await Promise.all(
        attachments.map(async (attachment) => {
          const blob = await fetch(attachment.url, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
            .then((response) => response.blob())
            .catch((error) => {
              console.warn("Error downloading blob:", error);
              throw error;
            });

          const data = await this.frappeClient.uploadFile(
            blob,
            attachment.name,
            "Appointment",
            docname
          );
          return data;
        })
      );

      return results;
    } catch (error) {
      console.warn("Error downloading file:", error);
      return null;
    }
  }

  async createOrUpdateAppointment(recordId: string) {

    const lockKey = `lock:appointment:${recordId}`;
    if (this.env.FN_KV) {
      const isLocked = await this.env.FN_KV.get(lockKey);
      if (isLocked) {
        await this.env.FN_KV.delete(lockKey);
        console.log(`[LARK-SYNC] Blocked loop by KV lock: ${lockKey}`);
        return null;
      }
    }

    const record = await this.syncLarkRecord(recordId);
    const lead = await fetchLeadInfoByPhoneNumber(
      this.frappeClient,
      record.phone_number
    );
    const erpAppointment = await this.upsertERPAppointment(record, lead);
    return erpAppointment;
  }

  async createNewERPAppointment(
    dataRequest: ILarksuiteAppointment,
    lead?: IFrappeLead
  ) {
    const payload = await mapLarkToFrappe(this.frappeClient, dataRequest, lead);
    const data = await this.frappeClient.insert({
      doctype: "Appointment",
      ...payload
    });
    return data;
  }

  async updateERPAppointment(
    docName: string,
    dataRequest: ILarksuiteAppointment,
    lead?: IFrappeLead
  ) {
    const payload = await mapLarkToFrappe(this.frappeClient, dataRequest, lead);
    const data = await this.frappeClient.update({
      doctype: "Appointment",
      name: docName,
      ...payload
    });
    return data;
  }

  async upsertERPAppointment(
    dataRequest: ILarksuiteAppointment,
    lead?: IFrappeLead
  ) {
    await saveAppointmentToPrismaDb(this.env, dataRequest);

    if (dataRequest.appointment_name) {
      // 1. Update ERP
      const docName = dataRequest.appointment_name;

      // Lock both record_id and ERP name before updating ERP
      if (this.env.FN_KV) {
        await this.env.FN_KV.put(`lock:appointment-synced:${docName}`, "true", { expirationTtl: 60 });
        await this.env.FN_KV.put(`lock:appointment:${dataRequest.record_id}`, "true", { expirationTtl: 60 });
      }

      const attachments = await getDocumentAttachments(
        this.frappeClient,
        "Appointment",
        docName
      );
      await removeFileAttachment(this.frappeClient, attachments);
      await this.downloadFileAndUploadFrappe(
        dataRequest.product_images,
        docName
      );
      return await this.updateERPAppointment(docName, dataRequest, lead);
    } else {
      // 2. Create new ERP appointment
      const appointment = await this.createNewERPAppointment(dataRequest, lead);

      // Lock both record_id and ERP name after receiving ERP name
      if (this.env.FN_KV) {
        await this.env.FN_KV.put(`lock:appointment-synced:${appointment.name}`, "true", { expirationTtl: 60 });
        await this.env.FN_KV.put(`lock:appointment:${dataRequest.record_id}`, "true", { expirationTtl: 60 });
      }

      await this.downloadFileAndUploadFrappe(
        dataRequest.product_images,
        appointment.name
      );

      // @ts-expect-error
      await RecordService.updateLarksuiteRecord({
        env: this.env,
        appToken: this.appToken,
        tableId: this.tableId,
        recordId: dataRequest.record_id,
        fields: {
          "Appointment Name": appointment.name
        },
        userIdType: "open_id"
      });

      return appointment;
    }
  }

  static async dequeueAppointmentQueue(batch: any, env: any) {
    const appointmentService = AppointmentService.instance(env);
    const messages = batch.messages;
    for (const message of messages) {
      const messageBody = message.body;
      const recordId = messageBody.record_id;
      if (!recordId) {
        continue;
      }
      await appointmentService.createOrUpdateAppointment(recordId);
    }
  }
}
