import BaseClient from "../base-client";

export default class ScheduleClient extends BaseClient {
    constructor({ appId, appSecret }) {
        super({ appId, appSecret });
    }

    async query(user_id, check_date_from, check_date_to) {
        const path = "/attendance/v1/user_daily_shifts/query?employee_type=employee_id";
        const data = {
            "user_ids": [
                user_id
            ],
            "check_date_from": check_date_from,
            "check_date_to": check_date_to
        }
        return await this.postRequest(path, data);
    }
}