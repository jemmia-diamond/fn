import Larksuite from "services/larksuite";
import ERP from "services/erp";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "*/5 * * * *": // Every 5 minutes
      await ERP.Selling.SalesOrderService.syncDailySalesOrders(env); 
      break;
    case "0 * * * *": // At minute 0 every hour
      await ERP.CRM.LeadService.syncWebsiteLeads(env);
      await ERP.Telephony.CallLogService.syncStringeeCallLogs(env);
      await ERP.CRM.LeadService.syncCallLogLead(env);
      break;
    case "0 17 * * *": // 00:00 UTC +7
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      break;
    case "0 1 * * *": // 08:00 UTC +7
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      await Larksuite.Approval.InstanceService.syncInstancesToDatabase(env);
      break;
    case "30 1 * * *": // 08:30 UTC +7
      await ERP.Automation.AssignmentRuleService.disableAssignmentRuleOffHour(env);
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      await ERP.Automation.AssignmentRuleService.reAssignOffHourLeads(env);
      break;
    case "30 5 * * *": // 12:30 UTC +7
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
