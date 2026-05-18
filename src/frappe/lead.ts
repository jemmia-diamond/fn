import FrappeClient from "src/frappe/frappe-client";
import { IFrappeLead } from "src/services/larksuite/appointment/types";


export async function fetchLeadInfoByPhoneNumber(frappeClient: FrappeClient, phoneNumber: string) {
    try {
        if (!phoneNumber) return null;
        const lead: IFrappeLead[] = await frappeClient.getList("Lead", {
            fields: ["name", "first_name", "budget_lead", "proposed_budget", "phone", "email_id"],
            or_filters: [
                ["mobile_no", "like", `%${phoneNumber.replace(/^0/, "")}%`],
                ["phone", "like", `%${phoneNumber.replace(/^0/, "")}%`]
            ],
        });
        if (lead && lead.length > 0) {
            return lead[0];
        }
        return null;
    } catch (error) {
        console.warn("Error fetching lead info:", error);
        return null;
    }
}
