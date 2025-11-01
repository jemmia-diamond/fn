import PancakeClient from "pancake/pancake-client";
import FrappeClient from "frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class ConversationAssignmentService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
    this.db = Database.instance(env);
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  async getLastConversationAssigneesHistory(conversationId) {
    const result = await this.db.$queryRaw`
      SELECT 
          (c.assignee_histories -> (jsonb_array_length(c.assignee_histories) - 1)) ->'payload'->'added_users' AS added_users
          FROM pancake.conversation c
          WHERE c.id = ${conversationId};
    `;
    const userIds = result
      .filter((result) => result.added_users !== null)
      .map((result) => result.added_users[0].id);
    return userIds;
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
}
