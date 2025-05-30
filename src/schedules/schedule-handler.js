function scheduledJob(env, ctx) {
  // Do something 
  return env, ctx;
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
