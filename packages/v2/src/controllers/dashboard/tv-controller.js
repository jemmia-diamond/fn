import DashboardTVService from "services/dashboard/tv-service";

export default class DashboardTVController {
  static async show(ctx) {
    const { startDate, endDate } = await ctx.req.query();

    const dashboardTVService = new DashboardTVService(ctx.env);
    const data = await dashboardTVService.getTVData(startDate, endDate);

    return ctx.json(data);
  }
}
