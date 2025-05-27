export default {
    scheduled: async (controller, env, ctx) => {
        switch (controller.cron) {
            case "* * * * *":
                console.log("Running cron job");
                break;
            default:
                break;
        }
    }
}
