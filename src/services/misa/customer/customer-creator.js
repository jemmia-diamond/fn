import MisaClient from "services/clients/misa-client";
import * as Constants from "services/misa/constant";

const DEFAULT_BRANCH_ID = "01ea2abc-81da-4386-9f2b-673796bd520d";

export default class CustomerCreator {
  constructor(env) {
    this.env = env;
    this.misaClient = new MisaClient(env);
  }

  async syncCustomer(customerData) {
    await this.misaClient.getAccessToken();
    const haravanId = customerData.id;
    const created_by = customerData.created_by;
    const description = `Khách hàng tạo bởi ${created_by} từ ERP`;
    const phoneNumber = customerData.phone;

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

