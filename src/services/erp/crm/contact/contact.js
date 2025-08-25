import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { fetchContactsFromERP, saveContactsToDatabase } from "services/erp/crm/contact/utils/contact-helppers";

dayjs.extend(utc);

export default class ContactService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  constructor(env) {
    this.env = env;
    this.doctype = "Contact";
    this.frappeClient = new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  async syncContactsToDatabase(options = {}) {

    const { isSyncType = ContactService.SYNC_TYPE_AUTO, minutesBack = 10 } = options;
    const kv = this.env.FN_KV;
    const KV_KEY = "contact_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;

    if (isSyncType === ContactService.SYNC_TYPE_AUTO) {
      const lastDate = await kv.get(KV_KEY);
      fromDate = lastDate || dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    } else {
      fromDate = dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    }

    try {
      const contacts = await fetchContactsFromERP(this.frappeClient, this.doctype, fromDate, toDate, ContactService.ERPNEXT_PAGE_SIZE);
      if (Array.isArray(contacts) && contacts.length > 0) {
        await saveContactsToDatabase(this.db, contacts);
      }

      if (isSyncType === ContactService.SYNC_TYPE_AUTO) {
        await kv.put(KV_KEY, toDate);
      }
    } catch (error) {
      console.error("Error syncing leads to database:", error.message);
      // Handle when cronjon failed in 1 hour => we need to update the last date to the current date
      if (isSyncType === LeadService.SYNC_TYPE_AUTO && dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }
  static async cronSyncContactsToDatabase(env) {
    const syncService = new ContactService(env);
    return await syncService.syncContactsToDatabase({
      minutesBack: 10,
      isSyncType: ContactService.SYNC_TYPE_AUTO
    });
  }
}
