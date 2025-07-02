import FrappeClient from "../../../../frappe/frappe-client";

export default class LeadService {
  constructor(env) {
    this.env = env;
    this.doctype = "Lead";
    this.frappeClient = new FrappeClient({
      url: this.env.JEMMIA_ERP_BASE_URL,
      apiKey: this.env.JEMMIA_ERP_API_KEY,
      apiSecret: this.env.JEMMIA_ERP_API_SECRET
    });
  }

  async updateLeadInfoFromSummary(data, conversationId) {
    let res = await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.update_lead_from_summary",
      data: JSON.stringify({
        ...data,
        conversation_id: conversationId
      })
    });
    return res;
  }

  async findLeadByConversationId(conversationId) {
    const contacts = await this.frappeClient.getList("Contact", {
      filters:[["pancake_conversation_id", "=", conversationId]]
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
    if(!currentLead) {
      return null;
    }
    if (!currentLead.first_name || currentLead.first_name.toLowerCase() === "chưa rõ") {
      currentLead.first_name = data.name;
    }
    if (!currentLead.phone) {
      currentLead.phone = data.phone;
    }
    const lead = await this.frappeClient.update(currentLead);
    return lead;
  }

  async updateLead({
    leadName,
    phone,
    firstName,
  }) {
    const lead = await this.frappeClient.syncLeadByBatchUpdate([
      {
        "doctype": "Lead",
        "docname": leadName,
        "phone": phone,
        "first_name": firstName
      }
    ])
    return lead
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
    pancakeAvatarUrl,
    }) {
    const lead = await this.frappeClient.syncLeadByBatchInsertion([
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
          "pancake_avatar_url": pancakeAvatarUrl,
        }
      }
    ])
    return lead;   
  }
}
