import * as Sentry from "@sentry/cloudflare";
import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import { fetchContactsFromERP, saveContactsToDatabase, deleteContactFromDatabase } from "services/erp/contacts/contact/utils/contact-helppers";

dayjs.extend(utc);

export default class ContactService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
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
    this.db = Database.instance(env);
    this.defaultContactName = "DEFAULT CONTACT";
    this.defaultWebsiteContactSourceGroup = "Website Form";
    this.defaultCallLogSourceGroup = "Call Center";
  };

  async findContactByPrimaryPhone(phone) {
    const contacts = await this.frappeClient.getList(this.doctype, {
      filters: [
        ["Contact Phone", "phone", "=", phone],
        ["Contact Phone", "is_primary_phone", "=", true],
        ["haravan_customer_id", "is", "set"]
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

  async processHaravanContact(customerData, customer) {
    const nameParts = customerData["phone"] ? [customerData.last_name, customerData.first_name].filter(Boolean) : [this.defaultContactName];
    const mappedContactData = {
      doctype: this.doctype,
      first_name: nameParts.join(" "),
      haravan_customer_id: String(customerData.id)
    };

    if (customerData["phone"]) {
      mappedContactData.phone_nos = [
        {
          "phone": customerData["phone"],
          "is_primary_phone": 1
        }
      ];

      const existingContact = await this.findContactByPrimaryPhone(customerData["phone"]);
      if (existingContact) {
        if (customer) {
          return await this.frappeClient.reference(existingContact, "Contact", customer, "Customer");
        }
        return existingContact;
      }
    }

    const contact = await this.frappeClient.upsert(mappedContactData, "haravan_customer_id");
    if (customer) {
      return await this.frappeClient.reference(contact, "Contact", customer, "Customer");
    };
    return contact;
  }

  async processWebsiteContact(data, lead, source = null) {
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
      source: source || lead.source,
      source_group: this.defaultWebsiteContactSourceGroup
    };

    const defaultContact = await this.frappeClient.getList(this.doctype, {
      filters: [
        ["Dynamic Link", "link_name", "=", lead.name],
        ["Contact Phone", "phone", "=", data.raw_data.phone],
        ["source", "=", lead.source],
        ["custom_uuid", "=", null]
      ]
    });

    if (defaultContact.length > 0) {
      for (const contact of defaultContact) {
        await this.frappeClient.update({
          ...contact,
          ...contactData
        });
      }
    } else {
      const contact = await this.frappeClient.upsert(contactData, "custom_uuid");
      // reference contact with lead
      const contactWithLinks = await this.frappeClient.getDoc(this.doctype, contact.name);
      await this.frappeClient.update(this.reference(contactWithLinks, lead));
    }
  }

  async processCallLogContact(data, lead, source) {
    const phone = data.type === "Incoming" ? data.from : data.to;
    const contactData = {
      doctype: this.doctype,
      stringee_id: data.id,
      first_name: phone,
      inserted_at: data.start_time,
      source: source,
      source_group: this.defaultCallLogSourceGroup,
      phone_nos: [
        {
          "phone": phone,
          "is_primary_phone": 1
        }
      ]
    };
    const contact = await this.frappeClient.upsert(contactData, "stringee_id");
    // reference contact with lead
    await this.frappeClient.reference(contact, this.doctype, lead, "Lead");
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
      Sentry.captureException(error);
      // Handle when cronjon failed in 1 hour => we need to update the last date to the current date
      if (isSyncType === ContactService.SYNC_TYPE_AUTO && dayjs(toDate).diff(dayjs(await kv.get(KV_KEY)), "hour") >= 1) {
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

  static async dequeueContactQueue(batch, env) {
    const contactService = new ContactService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const body = message.body;
      const docEvent = body.doc_event;
      const contactName = body.name;
      const doctype = body.doctype;
      try {
        if (docEvent && contactName && doctype === contactService.doctype) {
          await contactService.processContactFromWebhook(body, docEvent);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
  async processContactFromWebhook(data, docEvent) {
    const contactName = data.name;
    if (docEvent === "on_trash") {
      return await deleteContactFromDatabase(this.db, contactName);
    }
  }
}
