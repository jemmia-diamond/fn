import RecordService from "services/larksuite/docs/base/record/record";
import { LarksuiteAppointmentRawFields, LarksuiteAppointmentParsedFields, IFrappeLead, ILarksuitAppointment, LarksuiteSalePerson, IFrappeSalesPerson } from "./types";
import { PrismaClient } from "@prisma-cli";
import Database from "services/database";
import FrappeClient from "src/frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import LarksuiteService from "../lark";
import * as lark from "@larksuiteoapi/node-sdk";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class AppointmentService {
  env: any;
  db: PrismaClient;
  frappeClient: FrappeClient;

  private static _instance: AppointmentService;

  // Cache for Sales Persons
  private salesPersonCache: IFrappeSalesPerson[] | null = null;
  private salesPersonCacheTime: number = 0;

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
    // @ts-ignore
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  async syncLarkRecord(appToken: string, tableId: string, recordId: string): Promise<ILarksuitAppointment> {
    // @ts-ignore
    const record = await RecordService.getLarksuiteRecord({
      env: this.env,
      appToken,
      tableId,
      recordId
    });

    if (!record) {
      throw new Error(`Lark record not found`);
    }

    const rawFields = (record.fields || {}) as LarksuiteAppointmentRawFields;

    const fields: LarksuiteAppointmentParsedFields = {
      store: rawFields['Cửa hàng']?.[0] || '',
      name: rawFields['Tên khách hàng/ facebook'] || '',
      phone_number: rawFields['Số điện thoại'] || '',
      gender: rawFields['Giới tính'] || '',
      product_images: rawFields['Hình ảnh sản phẩm (nếu có)'] || null,
      note: rawFields['Lưu ý đặc biệt'] || null,
      date_time: rawFields['Ngày khách dự kiến tới CH'] ? new Date(rawFields['Ngày khách dự kiến tới CH']) : null,
      conversation_greeting: rawFields['Nội dung đón tiếp tại cửa hàng'] || null,
      customer_response: rawFields['Offlie Phản hồi'] || null,
      main_sales: rawFields['Sale chính'] || null,
      offline_sales: rawFields['Sale Offline tiếp nhận'] || null,
      status: rawFields['Trạng thái đơn hàng'] || null,
      policy: rawFields['Chính sách thu mua thu đổi'] || null,
    };

    const data: ILarksuitAppointment = {
      record_id: recordId,
      ...fields,
      product_images: fields.product_images ? fields.product_images : null,
      main_sales: fields.main_sales ? fields.main_sales : null,
      offline_sales: fields.offline_sales ? fields.offline_sales : null,
    };

    return data;
  }

  async getDocumentAttachments(doctype: string, docname: string) {
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
      console.error(`Error fetching attachments for ${doctype} ${docname}:`, error);
      return [];
    }
  }

  async downloadFile(fileToken: string) {
    try {
      const larkClient: lark.Client = await LarksuiteService.createClientV2(this.env);
      const response = await larkClient.drive.file.download({
        path: {
          file_token: fileToken
        }
      });

      const stream = await response.getReadableStream();
      return stream;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  }

  async fetchLeadInfoByPhoneNumber(phoneNumber: string) {
    try {
      const lead: IFrappeLead[] = await this.frappeClient.getList("Lead", {
        fields: ["name", "first_name", "budget_lead", "proposed_budget", "phone", "email_id"],
        filters: {
          phone: phoneNumber
        }
      });
      return lead;
    } catch (error) {
      console.error("Error fetching lead info:", error);
      return null;
    }
  }

  async getAllSalesPersons(): Promise<IFrappeSalesPerson[]> {
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();

    // Return cached data if valid
    if (this.salesPersonCache && (now - this.salesPersonCacheTime < CACHE_TTL)) {
      return this.salesPersonCache;
    }

    try {
      const salesPersons = await this.frappeClient.getList("Sales Person", {
        fields: ["name", "sales_person_name", "employee_email"],
        limit_page_length: 1000 // Ensure we get a large enough batch to cover all sales persons
      });

      // Update cache
      this.salesPersonCache = salesPersons;
      this.salesPersonCacheTime = now;

      return salesPersons;
    } catch (error) {
      console.error("Error fetching Sales Persons:", error);
      // Fallback to cache if request fails but cache exists, otherwise return empty array
      return this.salesPersonCache || [];
    }
  }

  private async mapLarkToFrappe(dataRequest: ILarksuitAppointment, lead?: IFrappeLead) {
    let gender = "Male";
    if (dataRequest.gender?.toLowerCase() === "nữ" || dataRequest.gender?.toLowerCase() === "female") {
      gender = "Female";
    } else if (dataRequest.gender?.toLowerCase() === "lgbt") {
      gender = "LGBT";
    }

    const scheduledTime = dataRequest.date_time
      ? dayjs(dataRequest.date_time).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
      : undefined;

    const salesPersons = await this.getAllSalesPersons();
    const mapSalesPerson = (person: LarksuiteSalePerson) => {
      const matched = salesPersons.find((sp: IFrappeSalesPerson) => sp.employee_email === person.email);
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
      offline_sales: offline_sales.filter(Boolean),
    };
  }

  async createNewERPAppointment(dataRequest: ILarksuitAppointment, lead?: IFrappeLead) {
    const payload = await this.mapLarkToFrappe(dataRequest, lead);
    const data = await this.frappeClient.insert({
      doctype: "Appointment",
      ...payload
    });
    return data;
  }

  async updateERPAppointment(recordId: string, dataRequest: ILarksuitAppointment, lead?: IFrappeLead) {
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

  async upsertERPAppointment(dataRequest: ILarksuitAppointment, lead?: IFrappeLead) {
    const existing = await this.frappeClient.getList("Appointment", {
      filters: { record_id: dataRequest.record_id },
      limit_start: 1
    });

    if (existing && existing.length > 0) {
      return await this.updateERPAppointment(dataRequest.record_id, dataRequest, lead);
    } else {
      return await this.createNewERPAppointment(dataRequest, lead);
    }
  }
}
