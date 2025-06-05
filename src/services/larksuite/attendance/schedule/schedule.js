import ScheduleClient from "../../../../larksuite/modules/attendance/schedule";
import { neon } from "@neondatabase/serverless";
import dayjs from "dayjs";

export default class ScheduleService {
  constructor(env) {
    this.env = env;
    this.scheduleClient = new ScheduleClient({ appId: env.LARKSUITE_APP_ID, appSecret: env.LARKSUITE_APP_SECRET });
    this.dbConnector = neon(env.DATABASE_URL);
  }

  static async syncScheduleToDatabase(env) {
    const scheduleService = new ScheduleService(env);

    const currentDate = dayjs();
    const timeThresholdStart = Number(currentDate.format("YYYYMMDD"));
    const timeThresholdEnd = Number(currentDate.add(1, "day").format("YYYYMMDD"));

    const users = await scheduleService.dbConnector.query(`
            SELECT
            user_id
            FROM larksuite.users
        `);
    const userIds = users.map(user => user.user_id);

    const allShifts = [];
    for(const userId of userIds) {
      const schedule = await scheduleService.scheduleClient.query({
        user_id: userId,
        check_date_from: timeThresholdStart,
        check_date_to: timeThresholdEnd
      });
      allShifts.push(...schedule.user_daily_shifts);
    }

    // Insert shifts into larksuite.attendance_shifts table
    for (const shift of allShifts) {
      await scheduleService.dbConnector.query(`
                INSERT INTO larksuite.user_daily_shifts (
                    day_no, group_id, month, shift_id, user_id
                ) VALUES (
                    $1, $2, $3, $4, $5
                )
                ON CONFLICT (day_no, group_id, month, shift_id, user_id) 
                DO NOTHING;
            `,[
        shift.day_no,
        shift.group_id,
        shift.month,
        shift.shift_id,
        shift.user_id
      ]);
    }
  }
}
