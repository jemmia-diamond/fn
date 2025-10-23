import Database from "services/database";

export default class DashboardTVService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async getTVData(startDate, endDate) {
    const [targetRevenueData, ordersByDayData] = await Promise.all([
      this.getTargetRevenueData(startDate, endDate),
      this.getOrdersByDayData(startDate, endDate)
    ]);

    return {
      targetRevenue: targetRevenueData,
      ordersByDay: ordersByDayData
    };
  }

  async getTargetRevenueData(startDate, endDate) {
    return await this.db.$queryRaw`
      SELECT end_time_7_utc as "month",
             sum(target_value::FLOAT) as "revenue"
      FROM dashboard_reporting.kpis_view
      WHERE start_time_7_utc >= ${startDate}
        AND end_time_7_utc <= ${endDate}
      GROUP BY end_time_7_utc
    `;
  }

  async getOrdersByDayData(startDate, endDate) {
    return await this.db.$queryRaw`
      SELECT DATE(real_created_at_7_utc) as date,
             SUM(total_price)::FLOAT as revenue,
             COUNT(*)::INT as orders
      FROM dashboard_reporting.order_dim
      WHERE (source NOT LIKE '%bhsc%'
             AND source NOT IN ('harafunnel','sendo'))
        AND total_price > 1200000
        AND cancelled_status = 'uncancelled'
        AND confirmed_status = 'confirmed'
        AND real_created_at_7_utc >= ${startDate}
        AND real_created_at_7_utc <= ${endDate}
      GROUP BY DATE(real_created_at_7_utc)
      ORDER BY date
    `;
  }
}
