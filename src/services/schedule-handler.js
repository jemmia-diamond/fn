import Larksuite from "../services/larksuite/index.js";
import ERP from "../services/erp/index.js";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "*/5 * * * *": // Every 5 minutes - Sales Order sync (10 minutes back)
      await ERP.Selling.SalesOrderSyncService.syncDailySalesOrders(env);
      break;
    case "0 * * * *": // At minute 0 every hour
      await ERP.CRM.LeadService.syncWebsiteLeads(env);
      await ERP.Telephony.CallLogService.syncStringeeCallLogs(env);
      await ERP.CRM.LeadService.syncCallLogLead(env);
      break;
    case "0 17 * * *": // 17:00 (5 PM)
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      break;
    case "0 1 * * *": // 01:00 (1 AM)  
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      break;
    case "30 1 * * *": // 01:30 (1:30 AM)
      await ERP.Automation.AssignmentRuleService.disableAssignmentRuleOffHour(env);
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      await ERP.Automation.AssignmentRuleService.reAssignOffHourLeads(env);
      break;
    case "30 5 * * *": // 05:30 (5:30 AM)
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesMidDay(env);
      break;
    case "0 10 * * *": // 10:00 (10 AM)
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      break;
    case "0 14 * * *": // 14:00 (2 PM)
      await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
      break;
    default:
      break;
    };
  }
};
