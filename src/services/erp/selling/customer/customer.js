import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import { fetchCustomersFromERP, saveCustomersToDatabase } from "src/services/erp/selling/customer/utils/customer-helppers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class CustomerService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function

  constructor(env) {
    this.env = env;
    this.doctype = "Customer";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.defaultCustomerName = "Khách Vãng Lai";
    this.db = Database.instance(env);
    this.genderMap = ["Female", "Male"];
  };

  async processHaravanCustomer(customerData, contact, address) {
    const nameParts = [customerData.last_name, customerData.first_name].filter(Boolean);
    const customerName = nameParts.join(" ") || this.defaultCustomerName;
    const mappedCustomerData = {
      doctype: this.doctype,
      customer_name: customerName,
      haravan_id: String(customerData.id),
      customer_type: "Individual",
      language: "vietnamese",
      customer_primary_contact: contact.name,
      customer_primary_address: address.name,
      birth_date: dayjs(customerData.birthday).format("YYYY-MM-DD"),
      gender: customerData.gender ? this.genderMap[customerData.gender] : null
    };

    const customer = await this.frappeClient.upsert(mappedCustomerData, "haravan_id");
    return customer;
  }

  async syncCustomersToDatabase(options = {}) {
    const { isSyncType = CustomerService.SYNC_TYPE_AUTO, minutesBack = 10 } = options;
    const kv = this.env.FN_KV;
    const KV_KEY = "customer_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;

    if (isSyncType === CustomerService.SYNC_TYPE_AUTO) {
      const lastDate = await kv.get(KV_KEY);
      fromDate = lastDate || dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    } else {
      fromDate = dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    }

    try {
      const customers = await fetchCustomersFromERP(this.frappeClient, this.doctype, fromDate, toDate, CustomerService.ERPNEXT_PAGE_SIZE);
      if (Array.isArray(customers) && customers.length > 0) {
        await saveCustomersToDatabase(this.db, customers);
      }

      if (isSyncType === CustomerService.SYNC_TYPE_AUTO) {
        await kv.put(KV_KEY, toDate);
      }
    } catch (error) {
      console.error("Error syncing customers to database:", error.message);
      // Handle when cronjon failed in 2 hour => we need to update the last date to the current date
      if (isSyncType === CustomerService.SYNC_TYPE_AUTO && dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 2) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }

  static async cronSyncCustomersToDatabase(env) {
    const syncService = new CustomerService(env);
    return await syncService.syncCustomersToDatabase({
      minutesBack: 10,
      isSyncType: CustomerService.SYNC_TYPE_AUTO
    });
  }
}
