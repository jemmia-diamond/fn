import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import {
  fetchAddressesFromERP,
  saveAddressesToDatabase,
} from "services/erp/contacts/address/utils/address-helppers";

dayjs.extend(utc);

export default class AddressService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  constructor(env) {
    this.env = env;
    this.doctype = "Address";
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET,
    });
    this.db = Database.instance(env);
  }

  async processHaravanAddress(addressData, customer) {
    let addressName;
    if (customer) {
      addressName = customer.customer_name;
    } else {
      const nameParts = [addressData.last_name, addressData.first_name].filter(
        Boolean,
      );
      addressName = nameParts.join(" ") || addressData.address1 || "No Entry";
    }
    const mappedAddressData = {
      doctype: this.doctype,
      address_name: addressName,
      haravan_id: String(addressData.id),
      province: addressData.province,
      district: addressData.district,
      ward: addressData.ward,
      address_line1: addressData.address1 || "No Entry",
      address_line2: addressData.address2,
    };
    if (customer) {
      mappedAddressData.links = [
        { link_doctype: customer.doctype, link_name: customer.name },
      ];
    }
    const address = await this.frappeClient.upsert(
      mappedAddressData,
      "haravan_id",
    );
    return address;
  }

  async syncAddressesToDatabase(options = {}) {
    const { isSyncType = AddressService.SYNC_TYPE_AUTO, minutesBack = 10 } =
      options;
    const kv = this.env.FN_KV;
    const KV_KEY = "address_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;

    if (isSyncType === AddressService.SYNC_TYPE_AUTO) {
      const lastDate = await kv.get(KV_KEY);
      fromDate =
        lastDate ||
        dayjs()
          .utc()
          .subtract(minutesBack, "minutes")
          .format("YYYY-MM-DD HH:mm:ss");
    } else {
      fromDate = dayjs()
        .utc()
        .subtract(minutesBack, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");
    }

    try {
      const addresses = await fetchAddressesFromERP(
        this.frappeClient,
        this.doctype,
        fromDate,
        toDate,
        AddressService.ERPNEXT_PAGE_SIZE,
      );
      if (Array.isArray(addresses) && addresses.length > 0) {
        await saveAddressesToDatabase(this.db, addresses);
      }

      if (isSyncType === AddressService.SYNC_TYPE_AUTO) {
        await kv.put(KV_KEY, toDate);
      }
    } catch (error) {
      console.error("Error syncing addresses to database:", error.message);
      // Handle when cronjon failed in 2 hour => we need to update the last date to the current date
      if (
        isSyncType === AddressService.SYNC_TYPE_AUTO &&
        dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 2
      ) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }

  static async cronSyncAddressesToDatabase(env) {
    const syncService = new AddressService(env);
    return await syncService.syncAddressesToDatabase({
      minutesBack: 10,
      isSyncType: AddressService.SYNC_TYPE_AUTO,
    });
  }
}
