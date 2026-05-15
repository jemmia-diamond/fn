import RecordService from "services/larksuite/docs/base/record/record";
import { LarksuiteAppointmentRawFields, LarksuiteAppointmentParsedFields, IFrappeLead, ILarksuiteAppointment, LarksuiteSalePerson, IFrappeSalesPerson, IFrapperAttachment, LarksuiteAttachment } from "src/services/larksuite/appointment/types";
import { PrismaClient } from "@prisma-cli";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import LarksuiteService from "src/services/larksuite/lark";
import { TIMEZONE_VIETNAM } from "src/constants";
import normalizePhoneNumber from "services/utils/normalize-phone-number";

dayjs.extend(utc);
dayjs.extend(timezone);

const GENDER_MAP: Record<string, string> = {
  "nam": "Male",
  "nữ": "Female",
  "lgbt": "LGBT"
};

export default class AppointmentService {
  env: any;
  db: PrismaClient;
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
  }

  async syncLarkRecord(appToken: string, tableId: string, recordId: string): Promise<ILarksuiteAppointment> {
    // @ts-expect-error This RecordService was written in javascript so we can not define the type for it
    const record = await RecordService.getLarksuiteRecord({
      env: this.env,
      appToken,
      tableId,
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
      product_images: rawFields["Hình ảnh sản phẩm (nếu có)"] || null,
      note: rawFields["Lưu ý đặc biệt"] || null,
      date_time: rawFields["Ngày khách dự kiến tới CH"] ? new Date(rawFields["Ngày khách dự kiến tới CH"]) : null,
      conversation_greeting: rawFields["Nội dung đón tiếp tại cửa hàng"] || null,
      customer_response: rawFields["Offlie Phản hồi"] || null,
      main_sales: rawFields["Sale chính"] || null,
      offline_sales: rawFields["Sale Offline tiếp nhận"] || null,
      status: rawFields["Trạng thái đơn hàng"] || null,
      policy: rawFields["Chính sách thu mua thu đổi"] || null
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

  async getDocumentAttachments(doctype: string, docname: string): Promise<IFrapperAttachment[]> {
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

  async downloadFileAndUploadFrappe(attachments: LarksuiteAttachment[], docname: string) {
    try {
      if (!attachments || attachments.length === 0) return;
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
    if (!attachments || attachments.length === 0) {
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

  async fetchLeadInfoByPhoneNumber(phoneNumber: string) {
    try {
      const lead: IFrappeLead[] = await this.frappeClient.getList("Lead", {
        fields: ["name", "first_name", "budget_lead", "proposed_budget", "phone", "email_id"],
        filters: {
          phone: normalizePhoneNumber(phoneNumber)
        }
      });
      return lead;
    } catch (error) {
      console.warn("Error fetching lead info:", error);
      return null;
    }
  }

  async getAllSalesPersons(employeeEmails: string[], names: string[]): Promise<IFrappeSalesPerson[]> {
    if ((!employeeEmails || employeeEmails.length === 0) && (!names || names.length === 0)) {
      return [];
    }

    try {
      const or_filters: any[] = [];
      if (employeeEmails && employeeEmails.length > 0) {
        or_filters.push(["employee_email", "in", employeeEmails]);
      }
      if (names && names.length > 0) {
        or_filters.push(["sales_person_name", "in", names]);
      }

      const salesPersons = await this.frappeClient.getList("Sales Person", {
        fields: ["name", "sales_person_name", "employee_email"],
        or_filters: or_filters,
        limit_page_length: 100
      });

      return salesPersons || [];
    } catch (error) {
      console.warn("Error fetching Sales Persons:", error);
      return [];
    }
  }

  private async mapLarkToFrappe(dataRequest: ILarksuiteAppointment, lead?: IFrappeLead) {
    const genderLower = dataRequest.gender?.toLowerCase() || "";
    const gender = GENDER_MAP[genderLower] || "Male";

    const scheduledTime = dataRequest.date_time
      ? dayjs(dataRequest.date_time).tz(TIMEZONE_VIETNAM).format("YYYY-MM-DD HH:mm:ss")
      : undefined;

    const allEmails = [...(dataRequest.main_sales || []), ...(dataRequest.offline_sales || [])].map(s => s.email).filter(Boolean);
    const allNames = [...(dataRequest.main_sales || []), ...(dataRequest.offline_sales || [])].map(s => s.name).filter(Boolean);
    const salesPersons = (allEmails.length > 0 || allNames.length > 0) ? await this.getAllSalesPersons(allEmails, allNames) : [];

    const mapSalesPerson = (person: LarksuiteSalePerson) => {
      const matched = salesPersons.find((sp: IFrappeSalesPerson) =>
        (sp.employee_email && sp.employee_email === person.email) ||
        (sp.sales_person_name && sp.sales_person_name === person.name)
      );
      if (matched) {
        return { sales_person: matched.name };
      }
      return null;
    };

    const main_sales = (dataRequest.main_sales || []).map(mapSalesPerson);
    const offline_sales = (dataRequest.offline_sales || []).map(mapSalesPerson);

    return {
      customer_name: dataRequest.name || "Khách hàng",
      customer_phone_number: dataRequest.phone_number,
      scheduled_time: scheduledTime,
      status: dataRequest.status || "Khách hẹn đến cửa hàng",
      store: dataRequest.store,
      gender: gender,
      conversation_greeting: dataRequest.conversation_greeting,
      customer_response: dataRequest.customer_response,
      notes: dataRequest.note,
      record_id: dataRequest.record_id,
      policy: dataRequest.policy,
      lead: lead ? lead.name : undefined,
      estimated_budget: lead ? lead.budget_lead : undefined,
      range_estimated_budget: lead ? lead.proposed_budget : undefined,
      main_sales: main_sales.filter(Boolean),
      offline_sales: offline_sales.filter(Boolean)
    };
  }

  async createNewERPAppointment(dataRequest: ILarksuiteAppointment, lead?: IFrappeLead) {
    const payload = await this.mapLarkToFrappe(dataRequest, lead);
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

    if (existing && existing.length > 0) {
      const docName = existing[0].name;
      const payload = await this.mapLarkToFrappe(dataRequest, lead);
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
    const existing = await this.frappeClient.getList("Appointment", {
      filters: { record_id: dataRequest.record_id },
      limit_start: 1
    });

    if (existing && existing.length > 0) {
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
