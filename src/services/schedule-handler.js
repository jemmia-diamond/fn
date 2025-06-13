import Larksuite from "../services/larksuite";
import ERP from "../services/erp";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 * * * *":
      await ERP.CRM.LeadService.scheduleToSyncLeadFromPancake(env);
      break;
    case "0 17 * * *": // 00:00
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      break;
    case "30 1 * * *": // 08:30
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      break;
    case "50 1 * * *": // 08:50
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      break;
    case "20 5 * * *": // 12:20
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesMidDay(env);
      break;
    case "20 10 * * *": // 17:20
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      break;
    default:
      break;
    };
  }
};
