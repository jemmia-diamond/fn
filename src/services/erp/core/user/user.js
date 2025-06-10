import FrappeClient from "../../../../frappe/frappe-client";
import Database from "../../../database";

export default class UserService {
    constructor(env) {
        this.env = env;
        this.doctype = "User";
        this.frappeClient = new FrappeClient({
            url: this.env.JEMMIA_ERP_BASE_URL,
            apiKey: this.env.JEMMIA_ERP_API_KEY,
            apiSecret: this.env.JEMMIA_ERP_API_SECRET
        });
        this.db = Database.instance(env);
    }

    static async syncLarkIds(env) {
        const userService = new UserService(env);
        const users = await userService.frappeClient.getList(userService.doctype, {
            filters: [
                ["pancake_id", "=", null]
            ]
        });
    }
}
