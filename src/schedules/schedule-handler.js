import Larksuite from "../services/larksuite";

export default {
  scheduled: async (controller, env, ctx) => {
    switch (controller.cron) {
    case "* * * * *":
      scheduledJob(env, ctx);
      break;
    case "0 0 * * *":
      await Larksuite.Contact.UserService.syncUsersToDatabase(env);
      break;
    default:
      break;
    };
  }
};
