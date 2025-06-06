import Larksuite from "../services/larksuite";

export default {
  scheduled: async (controller, env, _ctx) => {
    switch (controller.cron) {
    case "0 0 * * *":
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      break;
    case "30 8 * * *":
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
      break;
    default:
      break;
    };
  }
};
