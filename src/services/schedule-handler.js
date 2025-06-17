import Larksuite from "../services/larksuite";
import ERP from "../services/erp";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 17 * * *": // 00:00
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      await ERP.Core.UserService.syncLarkIds(env);
      break;
    case "0 1 * * *": // 08:00
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      await ERP.Automation.AssignmentRuleService.disableAssignmentRuleOffHour(env);
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesStartDay(env);
      break;
    case "0 5 * * *": // 12:00
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesMidDay(env);
      break;
    case "0 10 * * *": // 17:00
      await ERP.Automation.AssignmentRuleService.updateAssignmentRulesEndDay(env);
      break;
    case "0 14 * * *": // 21:00
      await ERP.Automation.AssignmentRuleService.enableAssignmentRuleOffHour(env);
      break;
    default:
      break;
    };
  }
};
