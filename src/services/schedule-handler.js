import Larksuite from "../services/larksuite/index.js";
import ERP from "../services/erp/index.js";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "*/5 * * * *": // Every 5 minutes - Sales Order sync (10 minutes back)
      await ERP.Selling.OrderService.syncDailySalesOrders(env); 
      break;
    case "0 * * * *": // At minute 0 every hour
      await ERP.CRM.LeadService.syncWebsiteLeads(env);
      await ERP.Telephony.CallLogService.syncStringeeCallLogs(env);
      await ERP.CRM.LeadService.syncCallLogLead(env);
      break;
    case "0 17 * * *": // 21:00 UTC +7
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      break;
    case "0 1 * * *": // 08:00 UTC +7
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      break;
    case "30 1 * * *": // 08:30 UTC +7
      await ERP.Automation.AssignmentRuleService.disableAssignmentRuleOffHour(env);
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      await ERP.Automation.AssignmentRuleService.reAssignOffHourLeads(env);
      break;
    case "30 5 * * *": // 08:30 UTC +7
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesMidDay(env);
      break;
    case "0 10 * * *": // 17:00 UTC +7
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      break;
    case "0 14 * * *": // 21:00 UTC +7
      await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
      break;
    default:
      break;
    };
  }
};
