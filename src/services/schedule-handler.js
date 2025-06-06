import Larksuite from "../services/larksuite";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 17 * * *":
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      break;
    case "30 1 * * *":
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      break;
    default:
      break;
    };
  }
};
