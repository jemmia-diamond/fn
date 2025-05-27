import frappeClient from "../../frappe/frappe-client";


export default class customerService {
    constructor(env) {
        this.env;
        this.frappeClient = new frappeClient(
            {
                url: env.JEMMIA_ERP_BASE_URL,
                apiKey: env.JEMMIA_ERP_API_KEY,
                apiSecret: env.JEMMIA_ERP_API_SECRET
            }
        );
    };

    async processHaravanCustomer(customerData, contact, address) {
        const nameParts = [customerData.last_name, customerData.first_name].filter(Boolean);
        const mappedCustomerData = {
            doctype: "Customer",
            customer_name: nameParts.join(" "),
            haravan_id: String(customerData.id),
            customer_type: "Individual",
            language: "vietnamese",
            customer_primary_contact: contact.name,
            customer_primary_address: address.name
        };

        const customer = await this.frappeClient.upsert(mappedCustomerData, "haravan_id");
        return customer;
    }
}