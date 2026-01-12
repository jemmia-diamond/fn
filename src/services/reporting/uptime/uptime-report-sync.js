import UptimeRobotClient from "services/clients/uptimerobot-client";
import Database from "services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as Sentry from "@sentry/cloudflare";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

const ONE_DAY = 1;
const SECONDS_IN_DAY = 86400;
const PERCENTAGE_DIVISOR = 100;
const LOGS_LIMIT = 0;
const DEFAULT_LOG_TYPE = "1-2";
export default class UptimeReportSyncService {
  constructor(env) {
    this.env = env;
    this.client = new UptimeRobotClient(env);
    this.db = Database.instance(env);
  }

  async syncUptimeReports(startDate = null, endDate = null, monitorIds = null) {
    if (!startDate) {
      startDate = dayjs().utc().subtract(ONE_DAY, "day");
    }
    if (!endDate) {
      endDate = dayjs().utc();
    }

    const allMonitors = await this.client.getAllMonitors();
    if (allMonitors.length === 0) {
      throw new Error(`No monitors found at ${endDate}`);
    }

    const targetMonitors = monitorIds || allMonitors.map(m => m.id);
    const dates = [];
    let iterDate = startDate;

    while (iterDate.isSameOrBefore(endDate, "day")) {
      dates.push(iterDate.toDate());
      iterDate = iterDate.add(1, "day");
    }

    for (const date of dates) {
      const reports = await this._fetchDailyUptimeForAllMonitors(targetMonitors, date, allMonitors);

      for (const report of reports) {
        await this.db.reportingUptimeReport.upsert({
          where: {
            monitorId_date: {
              monitorId: report.monitorId,
              date: report.date
            }
          },
          update: {
            monitorName: report.monitorName,
            totalTime: report.totalTime,
            uptime: report.uptime,
            downtime: report.downtime,
            uptimePercentage: report.uptimePercentage
          },
          create: report
        });
      }
    }
    return true;
  }

  async _fetchDailyUptimeForAllMonitors(monitorIds, date) {
    const startTimestamp = dayjs(date).startOf("day").unix();
    const endTimestamp = dayjs(date).endOf("day").unix();

    const response = await this.client.getMonitors(
      monitorIds, LOGS_LIMIT, DEFAULT_LOG_TYPE, `${startTimestamp}_${endTimestamp}`
    );

    const reports = [];
    for (const monitor of response.monitors) {
      const uptimePercentage = parseFloat(monitor.custom_uptime_ranges || "100");
      const uptime = Math.round((uptimePercentage / PERCENTAGE_DIVISOR) * SECONDS_IN_DAY);
      const downtime = SECONDS_IN_DAY - uptime;

      reports.push({
        monitorId: monitor.id.toString(),
        monitorName: monitor.friendly_name,
        date: dayjs(date).utc().startOf("day").toDate(),
        totalTime: SECONDS_IN_DAY,
        uptime,
        downtime,
        uptimePercentage
      });
    }
    return reports;
  }

  async dailySync() {
    try {
      await this.syncUptimeReports(dayjs().utc());
    } catch (error) {
      Sentry.captureException(error);
      return;
    }
  }
}
