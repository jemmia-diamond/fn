import Database from "services/database";
import FrappeClient from "frappe/frappe-client";
import { Prisma } from "@prisma-cli";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { SHIFTS, ASSIGNMENT_RULES } from "services/erp/automation/assigment-rule/enum";

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
    this.db = Database.instance(env);
    this.defaultUser = "tech@jemmia.vn";
  }

  async getAssignedUsers(regions) {
    const salesPeoplePromises = regions.map(region =>
      this.frappeClient.getList("Sales Person", {
        filters: [["sales_region", "=", region], ["assigned_lead", "=", true]]
      })
    );
    const salesPeopleResults = await Promise.all(salesPeoplePromises);
    const salesPeople = salesPeopleResults.flat();

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

  async getAttendingUsers(dayNo, month, shifts) {
    const emails = await this.db.$queryRaw`
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

  async updateAssignmentRule(defaultAssignmentRule, shifts, dayNo, month) {
    const users = await this.getAssignedUsers(defaultAssignmentRule.regionNames);
    const attendingUsers = await this.getAttendingUsers(dayNo, month, shifts);
    const assignedUsers = users.filter((userId) => attendingUsers.some((attendedUser) => attendedUser.email === userId));

    if (!assignedUsers.length) {
      assignedUsers.push(this.defaultUser);
    }

    const updatedAssignmentRule = await this.frappeClient.update(
      {
        "doctype": this.doctype,
        "name": defaultAssignmentRule.name,
        "users": assignedUsers.map((user) => ({ user }))
      }
    );
    return updatedAssignmentRule;
  }

  async updateAssignmentRules(shifts) {
    const timeThreshold = dayjs.utc();
    const dayNo = timeThreshold.date();
    const month = Number(timeThreshold.format("YYYYMM"));
    // Update assignment rules for three region
    await this.updateAssignmentRule(ASSIGNMENT_RULES.Lead_Facebook_Tiktok_ZaloKOC_Website_ZaloOA_HN, shifts, dayNo, month);
    await this.updateAssignmentRule(ASSIGNMENT_RULES.Lead_Facebook_Tiktok_ZaloKOC_Website_ZaloOA_HCM, shifts, dayNo, month);
    await this.updateAssignmentRule(ASSIGNMENT_RULES.Lead_Facebook_CT, shifts, dayNo, month);
  }

  // Static methods for external usage
  static async updateAssignmentRulesStartDay(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    const shifts = [SHIFTS.FIRST_SHIFT];
    await assignmentRuleService.updateAssignmentRules(shifts);
  }

  static async updateAssignmentRulesMidDay(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    const shifts = [SHIFTS.FIRST_SHIFT, SHIFTS.SECOND_SHIFT];
    await assignmentRuleService.updateAssignmentRules(shifts);
  }

  static async updateAssignmentRulesEndDay(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    const shifts = [SHIFTS.SECOND_SHIFT];
    await assignmentRuleService.updateAssignmentRules(shifts);
  }

  static async disableAssignmentRuleOffHour(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    const assignmentRuleName = ASSIGNMENT_RULES.OFF_HOURS.name;
    await assignmentRuleService.frappeClient.update({
      "doctype": assignmentRuleService.doctype,
      "name": assignmentRuleName,
      "disabled": 1
    });
  }

  static async enableAssignmentRuleOffHour(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    const assignmentRuleName = ASSIGNMENT_RULES.OFF_HOURS.name;
    await assignmentRuleService.frappeClient.update({
      "doctype": assignmentRuleService.doctype,
      "name": assignmentRuleName,
      "disabled": 0
    });
  }

  static async reAssignOffHourLeads(env) {
    const assignmentRuleService = new AssignmentRuleService(env);
    // Get all leads assigned to the default user
    const toDos = await assignmentRuleService.frappeClient.getList("ToDo", {
      filters: [
        ["allocated_to", "like", `%${assignmentRuleService.defaultUser}%`],
        ["status", "=", "Open"],
        ["reference_type", "=", "Lead"]
      ],
      fields: ["name", "reference_name"],
      limit_page_length: 100
    });
    if (!toDos.length) {return;}
    // Cancel all toDos
    const toDoDucuments = toDos.map((toDo) => {
      return {
        "doctype": "ToDo",
        "name": toDo.name,
        "status": "Cancelled"
      };
    });
    await assignmentRuleService.frappeClient.bulkUpdate(toDoDucuments);
    // Apply assignment rule
    const leadNames = toDos.map((toDo) => toDo.reference_name);
    await assignmentRuleService.frappeClient.postRequest("", {
      cmd: "frappe.automation.doctype.assignment_rule.assignment_rule.bulk_apply",
      doctype: "Lead",
      docnames: JSON.stringify(leadNames)
    });
  }
}
