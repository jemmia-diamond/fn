import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { APPROVALS } from "services/larksuite/approval/constant";
import FrappeClient from "src/frappe/frappe-client";
import * as Sentry from "@sentry/cloudflare";

dayjs.extend(utc);

export default class BuyBackInstanceService {
  constructor(env) {
    this.env = env;
  }

  static async syncInstancesToDatabase(env) {
    const instanceService = new BuyBackInstanceService(env);
    const db = Database.instance(env);
    const larkClient = await LarksuiteService.createClientV2(env);
    const timeThreshold = dayjs().utc();
    const start_time = timeThreshold.subtract(1, "day").subtract(1, "hour").unix() * 1000;
    const end_time = timeThreshold.add(12, "hour").unix() * 1000;
    const page_size = 100;

    const transformedInstances = [];
    const payload = {
      params: {
        start_time, end_time, page_size,
        approval_code: APPROVALS.BUYBACK_EXCHANGE.code
      }
    };

    const responses = await LarksuiteService.requestWithPagination(
      larkClient.approval.v4.instance.list, payload, page_size
    );

    const codes = responses.flatMap(res => (res?.data?.instance_code_list ?? []));

    for (const code of codes) {
      const instanceResponse = await larkClient.approval.v4.instance.get({
        path: {
          instance_id: code
        }
      });
      const instance = instanceResponse.data;
      const transformedInstance = instanceService.transformBuybackInstance(instance);
      const formData = APPROVALS.BUYBACK_EXCHANGE.formTransformFunction(instance.form);
      const finalInstance = { ...transformedInstance, ...formData };
      transformedInstances.push(finalInstance);
    }

    for (const instance of transformedInstances) {
      await db.larksuiteBuybackExchangeApprovalInstance.upsert({
        where: {
          instance_code: instance.instance_code
        },
        update: {
          serial_number: instance.serial_number,
          instance_type: instance.instance_type,
          order_code: instance.order_code,
          new_order_code: instance.new_order_code,
          status: instance.status,
          customer_name: instance.customer_name,
          phone_number: instance.phone_number,
          national_id: instance.national_id,
          products_info: instance.products_info,
          reason: instance.reason,
          refund_amount: instance.refund_amount ? parseFloat(instance.refund_amount) : null,
          is_synced_to_crm: false,
          updated_at: new Date(),
          submitted_date: instance.submitted_date,
          department_id: instance.department_id,
          department_name: instance.department_name,
          product_handed_over_at: instance.handover_date,
          user_id: instance.user_id
        },
        create: {
          instance_code: instance.instance_code,
          serial_number: instance.serial_number,
          instance_type: instance.instance_type,
          order_code: instance.order_code,
          new_order_code: instance.new_order_code,
          status: instance.status,
          customer_name: instance.customer_name,
          phone_number: instance.phone_number,
          national_id: instance.national_id,
          products_info: instance.products_info,
          reason: instance.reason,
          refund_amount: instance.refund_amount ? parseFloat(instance.refund_amount) : null,
          is_synced_to_crm: false,
          created_at: new Date(),
          updated_at: new Date(),
          submitted_date: instance.submitted_date,
          department_id: instance.department_id,
          department_name: instance.department_name,
          product_handed_over_at: instance.handover_date,
          user_id: instance.user_id
        }
      });
    }
  }

  transformBuybackInstance = (instance) => {
    return {
      instance_code: instance.instance_code,
      serial_number: instance.serial_number,
      status: instance.status,
      submitted_date: instance.start_time ? new Date(Number(instance.start_time)) : null,
      new_order_code: instance.new_order_code,
      user_id: instance.user_id
    };
  };

  static async handleApprovalWebhook(env, event) {
    if (event.approval_code !== APPROVALS.BUYBACK_EXCHANGE.code) {
      return;
    }

    const instanceService = new BuyBackInstanceService(env);
    const db = Database.instance(env);

    const larkClient = await LarksuiteService.createClientV2(env);
    let instanceResponse;
    try {
      instanceResponse = await larkClient.approval.v4.instance.get({
        path: {
          instance_id: event.instance_code
        }
      });
    } catch (err) {
      throw err;
    }

    if (!instanceResponse || !instanceResponse.data) {
      console.warn("No instance data returned from Lark", { instance_code: event.instance_code });
      return;
    }

    const instance = instanceResponse.data;

    const transformedInstance = instanceService.transformBuybackInstance(instance);
    const formData = APPROVALS.BUYBACK_EXCHANGE.formTransformFunction(instance.form || []);
    const finalInstance = { ...transformedInstance, ...formData };
    const prepareDbData = (instance) => ({
      instance_code: instance.instance_code,
      serial_number: instance.serial_number,
      instance_type: instance.instance_type,
      order_code: instance.order_code,
      new_order_code: instance.new_order_code,
      status: instance.status,
      customer_name: instance.customer_name,
      phone_number: instance.phone_number,
      national_id: instance.national_id,
      products_info: instance.products_info,
      reason: instance.reason,
      refund_amount: instance.refund_amount ? parseFloat(instance.refund_amount) : null,
      submitted_date: instance.submitted_date,
      updated_at: new Date(),
      department_id: instance.department_id,
      department_name: instance.department_name,
      product_handed_over_at: instance.handover_date,
      user_id: instance.user_id
    });

    const dbData = prepareDbData(finalInstance);

    await db.larksuiteBuybackExchangeApprovalInstance.upsert({
      where: {
        instance_code: finalInstance.instance_code
      },
      update: dbData,
      create: {
        ...dbData,
        is_synced_to_crm: false,
        created_at: new Date()
      }
    });

    try {
      await instanceService.upsertToErp(finalInstance);
    } catch (erpError) {
      Sentry.captureException(erpError);
    }

    await db.larksuiteBuybackExchangeApprovalInstance.update({
      where: { instance_code: finalInstance.instance_code },
      data: { is_synced_to_crm: true }
    });
  }

  async upsertToErp(data) {
    const frappeClient = FrappeClient.instance(this.env);

    let phoneNumber = data.phone_number;
    try {
      if (phoneNumber) {
        const phoneObj = JSON.parse(phoneNumber);
        if (phoneObj && phoneObj.national_number) {
          phoneNumber = phoneObj.national_number.replace(/\D/g, "");
        }
      }
    } catch {
      // Ignore parse error, use original string
    }

    const erpData = {
      doctype: "Buyback Exchange",
      lark_instance_id: data.instance_code,
      instance_type: data.instance_type,
      status: data.status,
      customer_name: data.customer_name,
      phone_number: phoneNumber,
      national_id: data.national_id,
      serial_number: data.serial_number,
      reason: data.reason,
      refund_amount: data.refund_amount,
      order_code: data.order_code,
      new_order_code: data.new_order_code,
      submitted_date: data.submitted_date ? dayjs(data.submitted_date).format("YYYY-MM-DD HH:mm:ss") : null,
      products_info: typeof data.products_info === "string" ? data.products_info : JSON.stringify(data.products_info || [])
    };
    const ignoredFields = Object.keys(erpData).filter(key => key !== "status" && key !== "doctype");

    try {
      await frappeClient.upsert(erpData, "lark_instance_id", ignoredFields);
    } catch (error) {
      const msg = error?.message || "";
      const isDuplicate = error?.status === 417
        || msg.includes("UniqueValidationError")
        || msg.includes("Duplicate entry");

      if (!isDuplicate) {
        throw error;
      }
    }
  }
}
