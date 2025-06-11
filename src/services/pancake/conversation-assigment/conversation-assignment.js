import PancakeClient from "../../../pancake/pancake-client";
import FrappeClient from "../../../frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class ConversationAssignmentService {
    static async test(env) {
        const pancakeClient = new PancakeClient(env.PANCAKE_ACCESS_TOKEN);
        const frappeClient = new FrappeClient({url: env.JEMMIA_ERP_BASE_URL,apiKey: env.JEMMIA_ERP_API_KEY, apiSecret: env.JEMMIA_ERP_API_SECRET});

        // const pageId = "110263770893806";
        // const conversationId = "110263770893806_8510227679079832";
        // const assigneeIds = [
        //     "22704d9c-1ed2-4c26-a26b-ca36e1e0ea26",
        //     "700baacf-f30e-4b72-aba6-c694ecf61347",
        // ];
        // const result = await pancakeClient.assignConversation(
        //     pageId,
        //     conversationId,
        //     assigneeIds
        // );

        const timeThreshold = dayjs.utc().subtract(10, "day").format("YYYY-MM-DD HH:mm:ss");
        const todoList = await frappeClient.getList("ToDo", {
            filters: [
                ["creation", ">=", timeThreshold],
                ["reference_type", "=", "Lead"],
                ["status", "=", "Open"],
                ["assignment_rule", "LIKE", "%Lead-Assignment-Sales%"]
            ]
        })
        if (!todoList.length) {return;}

        for (const todo of todoList) {
            const leadName = todo.reference_name;
            const allocatedUser = todo.allocated_to;
            console.log(leadName, allocatedUser);
        }
    }
}
