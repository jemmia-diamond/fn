function scheduledJob(env, ctx) {
  // Do something 
  // If return is needed, use an object to return multiple values
  // return { env, ctx };
};

export default {
  scheduled: async (controller, env, ctx) => {
    switch (controller.cron) {
    case "* * * * *":
      scheduledJob(env, ctx);
      break;
    default:
      break;
    };
  }
};
