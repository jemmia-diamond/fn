import FrappeClient from "../../../../frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class ContactService {
  constructor(env) {
    this.env = env;
    this.doctype = "Contact";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
    this.defaultContactPhone = "0000000000";
    this.defaultContactName = "DEFAULT CONTACT";
  };

  async findContactByPrimaryPhone(phone) {
    const contacts = await this.frappeClient.getList(this.doctype, {
      filters: [
        ["Contact Phone", "phone", "=", phone],
        ["Contact Phone", "is_primary_phone", "=", true]
      ]
    });
    if (contacts.length) {
      return await this.frappeClient.getDoc(this.doctype, contacts[0].name);
    }
    return null;
  }

  reference = (contact, doc) => {
    if (doc) {
      if (!contact.links) {
        contact.links = [];
      }
      contact.links.push({ "link_doctype": doc.doctype, "link_name": doc.name });
    };
    return contact;
  };

  async processHaravanContact(customerData, customer, address) {
    const customerPhone = customerData["phone"] || this.defaultContactPhone;
    const nameParts = customerData["phone"] ? [customerData.last_name, customerData.first_name].filter(Boolean) : [this.defaultContactName];
    const mappedContactData = {
      doctype: this.doctype,
      first_name: nameParts.join(" "),
      phone_nos: [
        {
          "phone": customerPhone,
          "is_primary_phone": 1
        }
      ]
    };

    if (address) {
      mappedContactData.address = address.name;
    };

    const targetContact = await this.findContactByPrimaryPhone(customerPhone);
    // Check if contact with phone already exists
    if (targetContact) {
      // Merge fields
      Object.assign(targetContact, mappedContactData);
      const referencedContact = this.reference(targetContact, customer);
      const contact = await this.frappeClient.update(referencedContact);
      return contact;
    }

    // Create new contact with referenced customer
    if (customer) {
      mappedContactData.links = [{ "link_doctype": customer.doctype, "link_name": customer.name }];
    };
    const contact = await this.frappeClient.insert(mappedContactData);
    return contact;
  }

  async processWebsiteContact(data, lead) {
    const contactData = {
      doctype: this.doctype,
      custom_uuid: data.custom_uuid,
      first_name: data.raw_data.name,
      inserted_at: dayjs(data.database_created_at).utc().format("YYYY-MM-DD HH:mm:ss"),
      phone_nos: [
        {
          "phone": data.raw_data.phone,
          "is_primary_phone": 1
        }
      ],
      source: lead.source
    };
    const contact = await this.frappeClient.upsert(contactData, "custom_uuid");
    // reference contact with lead
    const contactWithLinks = await this.frappeClient.getDoc(this.doctype, contact.name);
    await this.frappeClient.update(this.reference(contactWithLinks, lead));
  }
}
