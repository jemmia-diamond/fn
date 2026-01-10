import LarksuiteService from "services/larksuite/lark";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { APPROVALS } from "services/larksuite/approval/constant";

dayjs.extend(utc);

export default class BuyBackInstanceService {
  constructor(env) {
    this.env = env;
  }

  static async syncInstancesToDatabase(env) {
    const instanceService = new BuyBackInstanceService(env);
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
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
      await db.buyback_exchange_approval_instances.upsert({
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
          submitted_date: instance.submitted_date
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
          submitted_date: instance.submitted_date
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
      new_order_code: instance.new_order_code
    };
  };
}
