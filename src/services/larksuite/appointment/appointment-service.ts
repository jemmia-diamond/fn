import RecordService from "services/larksuite/docs/base/record/record";
import {
  LarksuiteAppointmentRawFields,
  LarksuiteAppointmentParsedFields,
  IFrappeLead,
  ILarksuiteAppointment,
  IFrapperAttachment,
  LarksuiteAttachment
} from "src/services/larksuite/appointment/types";
import { PrismaClient } from "@prisma-cli";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import LarksuiteService from "src/services/larksuite/lark";
import { fetchLeadInfoByPhoneNumber } from "frappe/lead";
import { mapLarkToFrappe } from "frappe/utils/utils-lark";
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
    this.appToken = env.LARK_APPOINTMENT_APP_TOKEN;
    this.tableId = env.LARK_APPOINTMENT_TABLE_ID;
  }

  private async syncLarkRecord(recordId: string): Promise<ILarksuiteAppointment> {
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
      store: rawFields["Cửa hàng"]?.[0] || "",
      name: rawFields["Tên khách hàng/ facebook"] || "",
      phone_number: rawFields["Số điện thoại"] || "",
      gender: rawFields["Giới tính"] || "",
      product_images: rawFields["Hình ảnh sản phẩm (nếu có)"],
      note: rawFields["Lưu ý đặc biệt"],
      date_time: rawFields["Ngày khách dự kiến tới CH"] ? new Date(rawFields["Ngày khách dự kiến tới CH"]) : null,
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

  private async getDocumentAttachments(doctype: string, docname: string): Promise<IFrapperAttachment[]> {
    try {
      const attachments = await this.frappeClient.getList("File", {
        fields: ["name", "file_name", "file_url", "is_private"],
        filters: {
          attached_to_doctype: doctype,
          attached_to_name: docname
        }
      });
      return attachments || [];
    } catch (error) {
      console.warn(`Error fetching attachments for ${doctype} ${docname}:`, error);
      return [];
    }
  }

  private async downloadFileAndUploadFrappe(attachments: LarksuiteAttachment[], docname: string) {
    try {
      if (!attachments?.length) return;
      const accessToken = await LarksuiteService.getTenantAccessToken(this.env);
      const results = await Promise.all(attachments.map(async (attachment) => {
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

        const data = await this.frappeClient.uploadFile(blob, attachment.name, "Appointment", docname);
        return data;
      }));

      return results;
    } catch (error) {
      console.warn("Error downloading file:", error);
      return null;
    }
  }

  async removeFileAttachment(attachments: IFrapperAttachment[]) {
    if (!attachments?.length) {
      return;
    }

    try {
      await Promise.all(attachments.map(async (attachment) => {
        await this.frappeClient.deleteDoc("File", attachment.name);
      }));
    } catch (error) {
      console.warn("Error removing file attachments:", error);
    }
  }

  async createOrUpdateAppointment(recordId: string) {
    const record = await this.syncLarkRecord(recordId);
    const lead = await fetchLeadInfoByPhoneNumber(this.frappeClient, record.phone_number);
    const erpAppointment = await this.upsertERPAppointment(record, lead);
    return erpAppointment;
  }

  async createNewERPAppointment(dataRequest: ILarksuiteAppointment, lead?: IFrappeLead) {
    const payload = await mapLarkToFrappe(this.frappeClient, dataRequest, lead);
    const data = await this.frappeClient.insert({
      doctype: "Appointment",
      ...payload
    });
    return data;
  }

  async updateERPAppointment(recordId: string, dataRequest: ILarksuiteAppointment, lead?: IFrappeLead) {
    const existing = await this.frappeClient.getList("Appointment", {
      filters: { record_id: recordId },
      limit_start: 0,
      limit_page_length: 1
    });

    if (existing?.length) {
      const docName = existing[0].name;
      const payload = await mapLarkToFrappe(this.frappeClient, dataRequest, lead);
      const data = await this.frappeClient.update({
        doctype: "Appointment",
        name: docName,
        ...payload
      });
      return data;
    } else {
      throw new Error(`Appointment with record_id ${recordId} not found in ERP`);
    }
  }

  async upsertERPAppointment(dataRequest: ILarksuiteAppointment, lead?: IFrappeLead) {
    const db = Database.instance(this.env);

    const dataToSave = {
      store: dataRequest.store,
      name: dataRequest.name,
      phone_number: dataRequest.phone_number,
      gender: dataRequest.gender,
      product_images: dataRequest.product_images ? (dataRequest.product_images as any) : null,
      note: dataRequest.note,
      date_time: dataRequest.date_time,
      conversation_greeting: dataRequest.conversation_greeting,
      customer_response: dataRequest.customer_response,
      main_sales: dataRequest.main_sales ? (dataRequest.main_sales as any) : null,
      offline_sales: dataRequest.offline_sales ? (dataRequest.offline_sales as any) : null,
      status: dataRequest.status,
      policy: dataRequest.policy
    };

    await db.larksuiteAppointment.upsert({
      where: { record_id: dataRequest.record_id },
      update: dataToSave,
      create: {
        record_id: dataRequest.record_id,
        ...dataToSave
      }
    });

    const existing = await this.frappeClient.getList("Appointment", {
      filters: { record_id: dataRequest.record_id },
      limit_start: 1
    });

    if (existing?.length) {
      const attachments = await this.getDocumentAttachments("Appointment", existing[0].name);
      await this.removeFileAttachment(attachments);
      await this.downloadFileAndUploadFrappe(dataRequest.product_images, existing[0].name);
      return await this.updateERPAppointment(dataRequest.record_id, dataRequest, lead);
    } else {
      const appointment = await this.createNewERPAppointment(dataRequest, lead);
      await this.downloadFileAndUploadFrappe(dataRequest.product_images, appointment.name);
      return appointment;
    }
  }
}
