import FrappeClient from "../../../../frappe/frappe-client";
import ConversationService from "../../../pancake/conversation/conversation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";
import { convertConversationPayload } from "../../../../utils/helper";

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);

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

  async handleSyncLead() {
    let conversationService = new ConversationService(this.env);
    let offset = 0;
    const batchSize = 200;
    let totalProcessed = 0;
    console.log("sqdsa");
    const updatedTime = dayjs()
      .utc()
      .subtract(1000, "minute")
      .format("YYYY-MM-DD HH:mm:ss");

    let baseCount = await conversationService.getBaseCount(updatedTime);

    while (offset <= baseCount) {
      const conversations =
        await conversationService.getConversationsToSyncLead(
          offset,
          batchSize,
          updatedTime
        );

      const insertLeads = [];
      const updateLeads = [];

      for (const conversation of conversations) {
        const payload = convertConversationPayload(conversation);

        if (!payload.doc_name) {
          insertLeads.push(payload);
        } else {
          updateLeads.push(payload);
        }
      }

      const batchCount = conversations.length;
      const insertCount = insertLeads.length;
      const updateCount = updateLeads.length;

      console.info(
        `Total: ${batchCount}, Insert leads: ${insertCount}, Update leads: ${updateCount}`
      );
      totalProcessed += batchCount;
      console.info(
        `Fetched offset: ${offset}, batchSize: ${batchSize}, batch count: ${batchCount}. Total processed: ${totalProcessed}`
      );

      offset += batchSize;

      // Insert leads
      if (insertLeads.length > 0) {
        const insertResponse = await this.insertLeadByBatch(insertLeads);

        if (!insertResponse || insertResponse.some((name) => name == null)) {
          throw new Error(
            `Invalid response from insertManyLeads: ${JSON.stringify(
              insertResponse
            )}`
          );
        }

        let trackingConversations = insertLeads.map((lead, i) => ({
          conversationId: lead.pancake_data.conversation_id,
          frappeNameId: insertResponse[i]
        }));

        trackingConversations = trackingConversations.filter(
          (e) => e.frappeNameId && e.conversationId
        );
        if (trackingConversations.length !== 0) {
          console.log("check");
          await conversationService.saveSyncedLeadsBatch(trackingConversations);
        }
      }

      if (updateLeads.length > 0) {
        await this.syncLeadByBatchUpdate(updateLeads);
      }
    }
  }

  async insertLeadByBatch(docs) {
    return await this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.insert_lead_by_batch",
      docs: JSON.stringify(docs)
    });
  }

  async syncLeadByBatchUpdate(docs) {
    return this.frappeClient.postRequest("", {
      cmd: "erpnext.crm.doctype.lead.lead_methods.update_lead_by_batch",
      docs: JSON.stringify(docs)
    });
  }
}
