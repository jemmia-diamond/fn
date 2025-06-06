import Database from "../../../database";
import FrappeClient from "../../../../frappe/frappe-client";
import { Prisma } from "@prisma-cli";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { SHIFTS, ASSIGNMENT_RULES } from "./enum";

dayjs.extend(utc);


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
    });
    const employeeNames = salesPeople.map((salesPerson) => salesPerson.employee);
    const employees = [];
    for (const employeeName of employeeNames) {
      const employee = await this.frappeClient.getList("Employee", {
        filters: [["name", "=", employeeName]]
      });
      employees.push(...employee);
    }
    const userIds = employees.map((employee) => employee.user_id);
    return userIds;
  }

  static async getattendingUsers(db, dayNo, month, shifts) {
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

  static async updateAssignmentRule(env, defaultAssignmentRule, shifts, dayNo, month) {
    const db = Database.instance(env);
    const assignmentRuleService = new AssignmentRuleService(env);

    const users = await assignmentRuleService.getAssignedUsers(defaultAssignmentRule.region_name);
    const attendingUsers = await AssignmentRuleService.getAttendingUsers(db, dayNo, month, shifts);
    const assignedUsers = users.filter((userId) => attendingUsers.some((attendedUser) => attendedUser.email === userId));

    const updatedAssignmentRule = await assignmentRuleService.frappeClient.update(
      {
        "doctype": assignmentRuleService.doctype,
        "name": defaultAssignmentRule.name,
        "users": assignedUsers.map((user) => ({ user }))
      }
    );
    return updatedAssignmentRule;
  }

  static async updateAssignmentRules(env, shifts) {

    const timeThreshold = dayjs.utc();
    const dayNo = timeThreshold.date();
    const month = Number(timeThreshold.format("YYYYMM"));

    await AssignmentRuleService.updateAssignmentRule(env, ASSIGNMENT_RULES.HN, shifts, dayNo, month);
    await AssignmentRuleService.updateAssignmentRule(env, ASSIGNMENT_RULES.HCM, shifts, dayNo, month);
    await AssignmentRuleService.updateAssignmentRule(env, ASSIGNMENT_RULES.CT, shifts, dayNo, month);
  }

  static async updateAssignmentRulesStartDay(env) {
    const shifts = [SHIFTS.FIRST_SHIFT];
    await AssignmentRuleService.updateAssignmentRules(env, shifts);
  }

  static async updateAssignmentRulesMidDay(env) {
    const shifts = [SHIFTS.FIRST_SHIFT, SHIFTS.SECOND_SHIFT];
    await AssignmentRuleService.updateAssignmentRules(env, shifts);
  }

  static async updateAssignmentRulesEndDay(env) {
    const shifts = [SHIFTS.SECOND_SHIFT];
    await AssignmentRuleService.updateAssignmentRules(env, shifts);
  }

}
