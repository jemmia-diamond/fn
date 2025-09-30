import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import ContactService from "services/erp/contacts/contact/contact";
import { areAllFieldsEmpty, fetchLeadsFromERP, saveLeadsToDatabase } from "services/erp/crm/lead/utils/lead-helppers";

dayjs.extend(utc);

export default class LeadService {
  static ERPNEXT_PAGE_SIZE = 100;
  static SYNC_TYPE_AUTO = 1; // auto sync when deploy app
  static SYNC_TYPE_MANUAL = 0; // manual sync when call function
  constructor(env) {
    this.env = env;
    this.doctype = "Lead";
    this.frappeClient = new FrappeClient({
      url: "http://dev.localhost:8000/",
      apiKey: "09610f2d1f36929",
      apiSecret: "7ec76a2e56406cf"
    });
    this.db = Database.instance(env);
    this.WebsiteFormLeadSource = "CRM-LEAD-SOURCE-0000023";
    this.defaultLeadOwner = "tech@jemmia.vn";
    this.CallLogLeadSource = "CRM-LEAD-SOURCE-0000022";
  }

  async updateLeadInfoFromSummary(data, conversationId) {

    if (!data) return;

    const allowedFields = [
      "budget_from",
      "budget_to",
      "interested_products",
      "province",
      "purpose",
      "expected_receiving_date"
    ];

    const summariedInfo = { ...data };

    // Remove any field not in allowedFields
    Object.keys(summariedInfo).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete summariedInfo[key];
      }
    });

    if (areAllFieldsEmpty(summariedInfo)) {
      return { success: true };
    }

    let res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.update_lead_from_summary",
      data: JSON.stringify({
        ...summariedInfo,
        conversation_id: conversationId
      })
    });
    return { success: true, data: res };
  }

  async findLeadByConversationId(conversationId) {
    const contacts = await this.frappeClient.getList("Contact", {
      filters: [["pancake_conversation_id", "=", conversationId]]
    });
    if (contacts.length) {
      const contact = await this.frappeClient.getDoc("Contact", contacts[0].name);
      const linkedLeads = contact.links.filter(link => link.link_doctype === this.doctype);
      if (linkedLeads.length) {
        return await this.frappeClient.getDoc(this.doctype, linkedLeads[0].link_name);
      }
    }
    return null;
  }

  async updateLeadFromSalesaya(name, data) {
    const currentLead = await this.frappeClient.getDoc(this.doctype, name);
    if (!currentLead) {
      return { success: false, message: "Lead does not exists" };
    }
    if (!currentLead.first_name || currentLead.first_name.toLowerCase() === "chưa rõ") {
      currentLead.first_name = data.name;
    }
    if (!currentLead.phone) {
      currentLead.phone = data.phone;
    }
    try {
      const lead = await this.frappeClient.update(currentLead);
      return { success: true, data: lead };
    } catch (error) {
      return {
        success: false,
        message: error
      };
    }
  }

  async updateLead({
    leadName,
    phone,
    firstName
  }) {
    const lead = await this.syncLeadByBatchUpdate([
      {
        "doctype": "Lead",
        "docname": leadName,
        "phone": phone,
        "first_name": firstName
      }
    ]);
    return lead;
  }

  async insertLead({
    firstName,
    phone,
    platform,
    conversationId,
    customerId,
    pageId,
    pageName,
    insertedAt,
    updatedAt,
    type,
    lastestMessageAt,
    pancakeUserId,
    pancakeAvatarUrl
  }) {
    const lead = await this.syncLeadByBatchInsertion([
      {
        "doctype": "Lead",
        "status": "Lead",
        "naming_series": "CRM-LEAD-.YYYY.-",
        "first_name": firstName,
        "phone": phone,
        "pancake_data": {
          "platform": platform,
          "conversation_id": conversationId,
          "customer_id": customerId,
          "page_id": pageId,
          "page_name": pageName,
          "inserted_at": insertedAt,
          "updated_at": updatedAt,
          "can_inbox": type === "INBOX" ? 1 : 0,
          "latest_message_at": lastestMessageAt,
          "pancake_user_id": pancakeUserId, // sale
          "pancake_avatar_url": pancakeAvatarUrl
        }
      }
    ]);
    return lead;
  }

  async syncLeadByBatchInsertion(docs) {
    return await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.insert_lead_by_batch",
      docs: JSON.stringify(docs)
    });
  }

  async syncLeadByBatchUpdate(docs) {
    return await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.update_lead_by_batch",
      docs: JSON.stringify(docs)
    });
  }

  async getWebsiteLeads(timeThreshold) {
    const result = await this.db.$queryRaw`
      SELECT * FROM ecom.leads l
      WHERE l.database_created_at > ${timeThreshold};
    `;
    return result;
  }

  async processWebsiteLead(data) {
    if (!data.raw_data) return;

    if (!data?.raw_data?.phone) {
      return;
    }

    try {
      const contactService = new ContactService(this.env);
      const location = data.raw_data.location;
      const provinces = await this.frappeClient.getList("Province", {
        filters: [["province_name", "LIKE", `%${location}%`]]
      });

      const leadData = {
        doctype: this.doctype,
        source: this.WebsiteFormLeadSource,
        first_name: data.raw_data.name,
        phone: data.raw_data.phone,
        lead_owner: this.defaultLeadOwner,
        province: provinces.length ? provinces[0].name : null,
        first_reach_at: dayjs(data.database_created_at).utc().format("YYYY-MM-DD HH:mm:ss")
      };

      const notes = [];
      if (data.raw_data.join_date) {
        notes.push({
          note: "Join Date: " + data.raw_data.join_date
        });
      }

      if (data.raw_data.demand) {
        notes.push({
          note: "Demand: " + data.raw_data.demand
        });
      }

      if (data.raw_data.diamond_note) {
        notes.push({
          note: "Diamond: " + data.raw_data.diamond_note
        });
      }

      if (notes.length) {
        leadData.notes = notes;
      }

      const ignoredFields = [
        "first_reach_at", "source"
      ];

      const lead = await this.frappeClient.upsert(leadData, "phone", ignoredFields);
      await contactService.processWebsiteContact(data, lead);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  static async syncWebsiteLeads(env) {
    const leadService = new LeadService(env);
    const timeThreshold = dayjs().utc().subtract(1, "hour").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const leads = await leadService.getWebsiteLeads(timeThreshold);
    if (leads.length) {
      for (const lead of leads) {
        await leadService.processWebsiteLead(lead);
      }
    }
  }

  async processCallLogLead(data) {
    const contactService = new ContactService(this.env);
    const phone = data.type === "Incoming" ? data.from : data.to;
    const leadData = {
      doctype: this.doctype,
      source: this.CallLogLeadSource,
      first_name: phone,
      phone: phone,
      lead_owner: this.defaultLeadOwner,
      first_reach_at: dayjs(data.creation).utc().format("YYYY-MM-DD HH:mm:ss")
    };
    const lead = await this.frappeClient.upsert(leadData, "phone", ["first_name"]);
    await contactService.processCallLogContact(data, lead);
  }

  static async syncCallLogLead(env) {
    const leadService = new LeadService(env);
    const timeThreshold = dayjs().utc().subtract(3, "hours").subtract(5, "minutes").format("YYYY-MM-DD HH:mm:ss");
    const callLogs = await leadService.frappeClient.getList("Call Log", {
      filters: [
        ["creation", ">=", timeThreshold],
        ["type", "=", "Incoming"]]
    });
    for (const callLog of callLogs.slice(0,1)) {
      await leadService.processCallLogLead(callLog);
    }
  }
  async syncLeadsToDatabase(options = {}) {

    const { isSyncType = LeadService.SYNC_TYPE_AUTO, minutesBack = 10 } = options;
    const kv = this.env.FN_KV;
    const KV_KEY = "lead_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;

    if (isSyncType === LeadService.SYNC_TYPE_AUTO) {
      const lastDate = await kv.get(KV_KEY);
      fromDate = lastDate || dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    } else {
      fromDate = dayjs().utc().subtract(minutesBack, "minutes").format("YYYY-MM-DD HH:mm:ss");
    }

    try {
      const leads = await fetchLeadsFromERP(this.frappeClient, this.doctype, fromDate, toDate, LeadService.ERPNEXT_PAGE_SIZE);
      if (Array.isArray(leads) && leads.length > 0) {
        await saveLeadsToDatabase(this.db, leads);
      }

      if (isSyncType === LeadService.SYNC_TYPE_AUTO) {
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
  static async cronSyncLeadsToDatabase(env) {
    const syncService = new LeadService(env);
    return await syncService.syncLeadsToDatabase({
      minutesBack: 10,
      isSyncType: LeadService.SYNC_TYPE_AUTO
    });
  }
}
