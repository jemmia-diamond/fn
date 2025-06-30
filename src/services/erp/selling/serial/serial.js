import FrappeClient from "../../../../frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "../../../database";

dayjs.extend(utc);

export default class SerialService {
  constructor(env) {
    this.env = env;
    this.doctype = "Serial";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.db = Database.instance(env);
  }

  async getSerialsToUpdate(timeThreshold) {
    const result = await this.db.$queryRaw`
      SELECT 
      vs.serial_number,
      v2.sku ,
      d.design_code
      FROM workplace.variant_serials vs
      	LEFT JOIN workplace.variants v ON vs.variant_id = v.id
      	INNER JOIN haravan.variants v2 ON v.haravan_variant_id = v2.id
      	LEFT JOIN workplace.products p ON v.product_id = p.id
      	LEFT JOIN workplace.designs d ON p.design_id = d.id
      WHERE 1 = 1
      AND (vs.id IN (SELECT tp.variant_serial_id FROM workplace.temporary_products tp) OR vs.variant_id IS NOT NULL)
      AND (vs.database_created_at > ${timeThreshold} OR vs.updated_at > ${timeThreshold})
      ORDER BY vs.serial_number
        `;
    return result;
  }

  static async syncSerialsToERP(env) {
    const timeThreshold = dayjs().utc().subtract(1, "hour").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const serialService = new SerialService(env);
    const serials = await serialService.getSerialsToUpdate(timeThreshold);
    for (const serial of serials) {
      await serialService.frappeClient.upsert({
        doctype: serialService.doctype,
        serial_number: serial.serial_number,
        sku: serial.sku,
        design_code: serial.design_code
      }, "serial_number");
    }
  }
}
