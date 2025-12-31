import MisaClient from "services/clients/misa-client";
import FrappeClient from "frappe/frappe-client";
import * as Constants from "services/misa/constant";

const DEFAULT_BRANCH_ID = "01ea2abc-81da-4386-9f2b-673796bd520d";
const TECH_TEAM = "tech@jemmia.vn";

export default class CustomerCreator {
  constructor(env) {
    this.env = env;
    this.misaClient = new MisaClient(env);
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.doctype = "Customer";
  }

  async fetchCustomerByHaravanId(haravanId) {
    try {
      const customers = await this.frappeClient.getList(this.doctype, {
        filters: [["haravan_id", "=", String(haravanId)]],
        fields: ["name", "customer_name", "haravan_id", "modified_by"]
      });

      return customers && customers.length > 0 ? customers[0] : null;
    } catch {
      return null;
    }
  }

  async syncCustomer(customerData) {
    await this.misaClient.getAccessToken();
    const haravanId = customerData.id;
    const address = customerData?.default_address?.address1 || customerData?.addresses[0]?.address1 || "Không có dữ liệu";
    const erpCustomer = await this.fetchCustomerByHaravanId(haravanId);
    const created_by = erpCustomer?.modified_by;
    const description = !created_by
      ? "Khách hàng được tạo từ Haravan khi phát sinh đơn hàng"
      : created_by === TECH_TEAM
        ? `Khách hàng tạo bởi ${created_by} khi tạo đơn hàng từ Haravan`
        : `Khách hàng tạo bởi ${created_by} từ ERP`;

    const phoneNumber = customerData.phone;
    const birth_date = customerData?.birthday;
    const contact_email = customerData?.email;

    const customerPayload = {
      branch_id: DEFAULT_BRANCH_ID,
      account_object_type: Constants.ACCOUNT_TYPE.CUSTOMER,
      dictionary_type: Constants.DICTIONARY_TYPE.ACCOUNT_OBJECT,
      account_object_id: crypto.randomUUID(),
      account_object_name: customerData.last_name + " " + customerData.first_name,
      account_object_code: haravanId,
      gender: customerData.gender,
      inactive: false,
      is_vendor: false,
      is_customer: true,
      is_employee: false,
      mobile: phoneNumber,
      tel: phoneNumber,
      created_by,
      description,
      address,
      birth_date,
      contact_email,
      State: Constants.STATE.ADD
    };

    const misaPayload = {
      app_id: this.env.MISA_APP_ID,
      org_company_code: this.env.MISA_ORG_CODE,
      dictionary: [customerPayload]
    };

    await this.misaClient.saveDictionary(misaPayload);
  }
}
