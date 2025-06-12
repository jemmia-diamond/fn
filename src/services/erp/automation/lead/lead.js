import LeadService from "../../crm/lead/lead";
export class AutomationLeadService {
  static async handleSyncLeadFromPancake(env) {
    let leadService = new LeadService(env);
    await leadService.handleSyncLead();
  }
}
