import FrappeClient from "../../frappe/frappe-client";


export default class ContactService {
    constructor(env) {
        this.env;
        this.doctype = "Contact";
        this.frappeClient = new FrappeClient(
            {
                url: env.JEMMIA_ERP_BASE_URL,
                apiKey: env.JEMMIA_ERP_API_KEY,
                apiSecret: env.JEMMIA_ERP_API_SECRET
            }
        );
    };

    async processHaravanContact(customerData, customer, address) {
        const nameParts = [customerData.last_name, customerData.first_name].filter(Boolean);
        const mappedContactData = {
            doctype: this.doctype,
            first_name: nameParts.join(" "),
            phone_nos: [
                {
                    "phone": customerData["phone"],
                    "is_primary_phone": 1
                }
            ]
        };

        if (address) {
            mappedContactData.address = address.name;
        };

        if (customer) {
            mappedContactData.links = [{ "link_doctype": customer.doctype, "link_name": customer.name }];
        };

        const contacts = await this.frappeClient.getList("Contact", { filters: [["Contact Phone", "phone", "=", customerData["phone"]]] });
        if (contacts.length > 0) {
            mappedContactData.name = contacts[0].name;
            const contact = await this.frappeClient.update(mappedContactData);
            return contact;
        };
        const contact = await this.frappeClient.insert(mappedContactData);
        return contact;
    }
}
