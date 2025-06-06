import LarksuiteService from "../../lark";
import * as lark from "@larksuiteoapi/node-sdk";
import Database from "../../../database";
import dayjs from "dayjs";

export default class ScheduleService {
  static async syncScheduleToDatabase(env) {
    const db = Database.instance(env);
    const larkClient = LarksuiteService.createClient(env);
    const tenantAccessToken = await LarksuiteService.getTenantAccessToken(env);

    const currentDate = dayjs();
    const timeThresholdStart = Number(currentDate.format("YYYYMMDD"));
    const timeThresholdEnd = Number(currentDate.add(1, "day").format("YYYYMMDD"));

    const userIds = await ScheduleService.getUsersIds(db);
    const schedulesSets = await Promise.all(userIds.map(userId => ScheduleService.getUserSchedule(larkClient, tenantAccessToken, userId, timeThresholdStart, timeThresholdEnd)));
    const schedules = schedulesSets.flat().filter(Boolean);

    for (const schedule of schedules) {
      await db.$queryRaw`INSERT INTO larksuite.user_daily_shifts (
          day_no, group_id, month, shift_id, user_id
      ) VALUES (
          ${schedule.day_no}, ${schedule.group_id}, ${schedule.month}, ${schedule.shift_id}, ${schedule.user_id}
      )
      ON CONFLICT (day_no, group_id, month, shift_id, user_id) 
      DO NOTHING;
      `;
    }
  }

  static async getUsersIds(db) {
    const users = await db.$queryRaw`SELECT user_id FROM larksuite.users`;
    return users.map(user => user.user_id);
  }

  static async getUserSchedule(larkClient, tenantAccessToken, userId, from, to) {
    const reponse = await larkClient.attendance.userDailyShift.query({
      params: {
        employee_type: 'employee_id',
      },
      data: {
        user_ids: [userId],
        check_date_from: from,
        check_date_to: to,
      },
    },
      lark.withTenantToken(tenantAccessToken)
    )
    return reponse.data.user_daily_shifts;
  }
}
