import Database from "../../database";
import FrappeClient from "../../../frappe/frappe-client";
import { Prisma } from "@prisma-cli";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const assignmentRules = {
  HN: {
    "name": "Lead-Assignment-Sales-HN",
    "region_name": "CRM-REGION-SOURCE-0000001"
  },
  HCM: {
    "name": "Lead-Assignment-Sales-HCM",
    "region_name": "CRM-REGION-SOURCE-0000002"
  },
  CT: {
    "name": "Lead-Assignment-Sales-CT",
    "region_name": "CRM-REGION-SOURCE-0000003"
  }
}

export default class AssignmentRuleService {
  constructor(env) {
    this.env = env;
    this.doctype = "Assignment Rule";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );
  }

  async getAssignedUsers(region) {
    const salesPeople = await this.frappeClient.getList("Sales Person", {
      filters: [["sales_region", "=", region]]
    })
    const employeeNames = salesPeople.map((salesPerson) => salesPerson.employee)
    const employees = []
    for (const employeeName of employeeNames) {
      const employee = await this.frappeClient.getList("Employee", {
        filters: [["name", "=", employeeName]]
      })
      employees.push(...employee)
    }
    const userIds = employees.map((employee) => employee.user_id)
    return userIds
  }

  static async updateAssignmentRule(env) {
    const db = Database.instance(env);
    const assignmentRuleService = new AssignmentRuleService(env);

    const timeThreshold = dayjs.utc();
    const dayNo = timeThreshold.date();
    const month = timeThreshold.month() + 1;

    console.log(dayNo, month);

    const defaultAssignmentRule = assignmentRules.HCM;
    const users = await assignmentRuleService.getAssignedUsers(defaultAssignmentRule.region_name);
    const attendedUsers = await AssignmentRuleService.getAttendedUsers(db, 6, 202506, ["Ca1", "Ca2"]);
    const assignedUsers = users.filter((user) => attendedUsers.some((attendedUser) => attendedUser.email === user));

    // console.log(assignedUsers);

    const updatedAssignmentRule = await assignmentRuleService.frappeClient.update(
      {
        "doctype": assignmentRuleService.doctype,
        "name": defaultAssignmentRule.name,
        "users": assignedUsers.map((user) => ({ user }))
      }
    );
    console.log(updatedAssignmentRule);
  }

  static async getAttendedUsers(db, dayNo, month, shifts) {
    const emails = await db.$queryRaw`
      SELECT 
      u.enterprise_email AS email
      FROM larksuite.users u 
      	INNER JOIN larksuite.user_daily_shifts uds ON u.user_id = uds.user_id
      	INNER JOIN larksuite."groups" g ON uds.group_id = g.group_id
      	INNER JOIN larksuite.shifts s ON uds.shift_id = s.shift_id
      WHERE 1 = 1
      AND uds.day_no = ${dayNo}
      AND uds."month" = ${month}
      AND g.group_name = 'Phòng Kinh Doanh'
      AND s.shift_name IN (${Prisma.join(shifts)})`;
    return emails;
  }
}
