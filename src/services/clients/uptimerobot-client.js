import { createAxiosClient } from "services/utils/http-client";

const GETTING_LOG = "1";
const LOGS_LIMIT = 0;
const DEFAULT_LOG_TYPE = "1-2";
export default class UptimeRobotClient {
  constructor(env) {
    this.env = env;
    this.baseUrl = "https://api.uptimerobot.com/v2";
    this.apiKey = this.env.UPTIMEROBOT_API_KEY;
    this.timeout = 100000;
    this.client = this._initClient();
  }

  _initClient() {
    return createAxiosClient({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }

  async getMonitors(
    monitorIds = null,
    logsLimit = LOGS_LIMIT,
    logTypes = DEFAULT_LOG_TYPE,
    logsStartDate = null,
    logsEndDate = null,
    customUptimeRanges = null
  ) {
    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    params.append("format", "json");
    params.append("logs", GETTING_LOG);

    if (logsLimit > 0) {
      params.append("logs_limit", logsLimit.toString());
    }

    params.append("log_types", logTypes);

    if (logsStartDate) {
      const timestamp = typeof logsStartDate === "number" ?
        logsStartDate : Math.floor(logsStartDate.getTime() / 1000);
      params.append("logs_start_date", timestamp.toString());
    }

    if (logsEndDate) {
      const timestamp = typeof logsEndDate === "number" ?
        logsEndDate : Math.floor(logsEndDate.getTime() / 1000);
      params.append("logs_end_date", timestamp.toString());
    }

    if (customUptimeRanges) {
      params.append("custom_uptime_ranges", customUptimeRanges);
    }

    if (monitorIds && monitorIds.length > 0) {
      params.append("monitors", monitorIds.join("-"));
    }

    const response = await this.client.post("/getMonitors", params.toString());
    return response.data;
  }

  async getAllMonitors() {
    const params = new URLSearchParams();
    params.append("api_key", this.apiKey);
    params.append("format", "json");

    const response = await this.client.post("/getMonitors", params.toString());

    if (response.data?.stat !== "ok") {
      throw new Error(`UptimeRobot API error: ${response.data?.error?.message || "Unknown error"}`);
    }

    return response.data.monitors || [];
  }
}
