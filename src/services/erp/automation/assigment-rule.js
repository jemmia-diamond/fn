import Database from "../../database";
import FrappeClient from "../../../frappe/frappe-client";

const assignmentRules = {
    HCM: {
        "name": "Lead-Assignment-Sales-HN",
        "region_name": "CRM-REGION-SOURCE-0000001"
    },
    HN: {
        "name": "Lead-Assignment-Sales-HCM",
        "region_name": "CRM-REGION-SOURCE-0000002"
    },
    CT: {
        "name": "Lead-Assignment-Sales-CT",
        "region_name": "CRM-REGION-SOURCE-0000003"
    }
}

export default class AssignmentRuleService {
    constructor(env) {
        this.env = env;
        this.doctype = "Assignment Rule";
        this.frappeClient = new FrappeClient(
            {
                url: env.JEMMIA_ERP_BASE_URL,
                apiKey: env.JEMMIA_ERP_API_KEY,
                apiSecret: env.JEMMIA_ERP_API_SECRET
            }
        );
    }

    async getAssignedUsers() {
    }

    static async updateAssignmentRule(env) {
        console.log(env);
    }
}