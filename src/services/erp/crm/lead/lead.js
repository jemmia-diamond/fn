import FrappeClient from "frappe/frappe-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import ContactService from "services/erp/contacts/contact/contact";
import { fetchLeadsFromERP, saveLeadsToDatabase } from "services/erp/crm/lead/utils/lead-helppers";

dayjs.extend(utc);

export default class LeadService {
  static ERPNEXT_PAGE_SIZE = 1000;
  constructor(env) {
    this.env = env;
    this.doctype = "Lead";
    this.frappeClient = new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
    this.WebsiteFormLeadSource = "CRM-LEAD-SOURCE-0000023";
    this.defaultLeadOwner = "tech@jemmia.vn";
    this.CallLogLeadSource = "CRM-LEAD-SOURCE-0000022";
  }

  async updateLeadInfoFromSummary(data, conversationId) {
    try {
      let res = await this.frappeClient.postRequest("", {
        cmd: "erpnext.crm.doctype.lead.lead_methods.update_lead_from_summary",
        data: JSON.stringify({
          ...data,
          conversation_id: conversationId
        })
      });
      return { success: true, data: res };
    } catch (error) {
      console.warn("Failed to update lead info from summary:", {
        error: error.message,
        conversationId,
        data
      });

      return { success: false, error: error.message };
    }
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
      return { success: true, data: lead};
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

    const lead = await this.frappeClient.upsert(leadData, "phone");
    await contactService.processWebsiteContact(data, lead);
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
    
    const { syncType = "auto", minutesBack = 10 } = options;
    const kv = this.env.FN_KV;
    const KV_KEY = "lead_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    let fromDate;
    
    if (syncType === "auto") {
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

      if (syncType === "auto") {
        await kv.put(KV_KEY, toDate);
      }
    } catch (error) {
      console.error("Error syncing leads to database:", error.message);
      // Handle error KV is not updated when the error continuously 3 times (1 hour)
      if (syncType === "auto") {
        const lastDate = await kv.get(KV_KEY);
        if (lastDate) {
          const timeDiffHours = dayjs(toDate).diff(dayjs(lastDate), "hour");
          if (timeDiffHours > 1) {
            await kv.put(KV_KEY, toDate);
          }
        }
      }
    }
  }
  static async cronSyncLeadsToDatabase(env) {
    const syncService = new LeadService(env);
    return await syncService.syncLeadsToDatabase({ 
      minutesBack: 90,  
      syncType: "auto"
    });
  }
}
