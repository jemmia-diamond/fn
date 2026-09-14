import PancakeClient from "pancake/pancake-client";
import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class ConversationAssignmentService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env);
    this.db = Database.instance(env);
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  async getLastConversationAssigneesHistory(conversationId) {
    const row = await this.db.conversation.findFirst({
      where: { id: String(conversationId) },
      select: { assignee_histories: true }
    });
    const histories = Array.isArray(row?.assignee_histories)
      ? row.assignee_histories
      : [];
    const last = histories.length ? histories[histories.length - 1] : null;
    const firstAddedId = last?.payload?.added_users?.[0]?.id;
    return firstAddedId ? [firstAddedId] : [];
  }

  async syncConversationAssigneesWithERPToDo(todo) {
    const leadName = todo.reference_name;
    const allocatedUser = todo.allocated_to;
    const allocatedUserPancakeId = (
      await this.frappeClient.getDoc("User", allocatedUser)
    ).pancake_id;
    const contacts = await this.frappeClient.getList("Contact", {
      filters: [["Dynamic Link", "link_name", "=", leadName]]
    });

    if (!contacts.length) {
      return null;
    }

    const contact = contacts[0];
    const pageId = contact.pancake_page_id;
    const conversationId = contact.pancake_conversation_id;
    const assigneesHistory =
      await this.getLastConversationAssigneesHistory(conversationId);
    const assignedUserIds = [
      ...new Set([...assigneesHistory, allocatedUserPancakeId])
    ];
    const res = await this.pancakeClient.assignConversation(
      pageId,
      conversationId,
      assignedUserIds
    );
    return res;
  }

  async syncConversationAssigneesWithLeadOwner(lead) {
    const leadName = lead.name;
    const leadOwner = lead.lead_owner;
    if (!leadOwner) return null;

    const leadOwnerPancakeId = (
      await this.frappeClient.getDoc("User", leadOwner)
    ).pancake_id;
    if (!leadOwnerPancakeId) return null;

    const contacts = await this.frappeClient.getList("Contact", {
      filters: [["Dynamic Link", "link_name", "=", leadName]]
    });
    if (!contacts.length) return null;

    const contact = contacts[0];
    const pageId = contact.pancake_page_id;
    const conversationId = contact.pancake_conversation_id;
    const assigneesHistory =
      await this.getLastConversationAssigneesHistory(conversationId);
    const assignedUserIds = [
      ...new Set([...assigneesHistory, leadOwnerPancakeId])
    ];
    const res = await this.pancakeClient.assignConversation(
      pageId,
      conversationId,
      assignedUserIds
    );
    return res;
  }
}
