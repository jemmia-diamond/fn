import FrappeClient from "../../../../frappe/frappe-client";

export default class AddressService {
  constructor(env) {
    this.env = env;
    this.doctype = "Address";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
  };

  async processHaravanAddress(addressData, customer) {
    let addressName;
    if (customer) {
      addressName = customer.customer_name;
    } else {
      const nameParts = [addressData.last_name, addressData.first_name].filter(Boolean);
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
      address_line2: addressData.address2
    };
    if (customer) {
      mappedAddressData.links = [{ "link_doctype": customer.doctype, "link_name": customer.name }];
    }
    const address = await this.frappeClient.upsert(mappedAddressData, "haravan_id");
    return address;
  };
};
