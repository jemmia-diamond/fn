import Larksuite from "../services/larksuite";

function scheduledJob(env, ctx) {
  // Do something 
  return { env, ctx };
};

export default {
  scheduled: async (controller, env, ctx) => {
    switch (controller.cron) {
    case "* * * * *":
      scheduledJob(env, ctx);
      break;
    case "0 0 * * *":
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      break;
    case "30 8 * * *":
      await Larksuite.Attendance.ScheduleService.syncScheduleToDatabase(env);
    default:
      break;
    };
  }
};
