import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import {
  IFrappeLead,
  IFrappeSalesPerson,
  ILarksuiteAppointment,
  LarksuiteSalePerson
} from "services/larksuite/appointment/types";
import FrappeClient from "frappe/frappe-client";

dayjs.extend(utc);

const GENDER_MAP: Record<string, string> = {
  nam: "Male",
  nữ: "Female",
  lgbt: "Other"
};

export async function getAllSalesPersons(
  frappeClient: FrappeClient,
  employeeEmails: string[],
  names: string[]
): Promise<IFrappeSalesPerson[]> {
  if (!employeeEmails?.length && !names?.length) {
    return [];
  }

  try {
    const or_filters: any[] = [];
    if (employeeEmails?.length) {
      or_filters.push(["employee_email", "in", employeeEmails]);
    }
    if (names?.length) {
      or_filters.push(["sales_person_name", "in", names]);
    }

    const salesPersons = await frappeClient.getList("Sales Person", {
      fields: ["name", "sales_person_name", "employee_email"],
      or_filters: or_filters,
      limit_page_length: 100
    });

    return salesPersons || [];
  } catch (error) {
    console.warn("Error fetching Sales Persons:", error);
    return [];
  }
}

export async function mapLarkToFrappe(
  frappeClient: FrappeClient,
  dataRequest: ILarksuiteAppointment,
  lead: IFrappeLead | null
) {
  const genderLower = dataRequest.gender?.toLowerCase() || "";
  const gender = GENDER_MAP[genderLower] || "Male";

  const scheduledTime = dataRequest.date_time
    ? dayjs.utc(dataRequest.date_time).format("YYYY-MM-DD HH:mm:ss")
    : undefined;

  const allEmails = [
    ...(dataRequest.main_sales || []),
    ...(dataRequest.offline_sales || [])
  ]
    .map((s) => s.email)
    .filter(Boolean);
  const allNames = [
    ...(dataRequest.main_sales || []),
    ...(dataRequest.offline_sales || [])
  ]
    .map((s) => s.name)
    .filter(Boolean);
  const salesPersons =
    allEmails.length > 0 || allNames.length > 0
      ? await getAllSalesPersons(frappeClient, allEmails, allNames)
      : [];

  const mapSalesPerson = (person: LarksuiteSalePerson) => {
    const matched = salesPersons.find(
      (sp: IFrappeSalesPerson) =>
        (sp.employee_email && sp.employee_email === person.email) ||
        (sp.sales_person_name && sp.sales_person_name === person.name)
    );
    if (matched) {
      return { sales_person: matched.name };
    }
    return null;
  };

  const main_sales = (dataRequest.main_sales || []).map(mapSalesPerson);
  const offline_sales = (dataRequest.offline_sales || []).map(mapSalesPerson);

  return {
    customer_name: dataRequest.name || "Khách hàng",
    customer_phone_number: lead?.phone || dataRequest.phone_number,
    scheduled_time: scheduledTime,
    status: dataRequest.status || "Khách hẹn đến cửa hàng",
    store: dataRequest.store,
    gender: gender,
    conversation_greeting: dataRequest.conversation_greeting,
    customer_response: dataRequest.customer_response,
    notes: dataRequest.note,
    record_id: dataRequest.record_id,
    policy: dataRequest.policy,
    lead: lead ? lead.name : undefined,
    estimated_budget: lead ? lead.budget_lead : undefined,
    range_estimated_budget: lead ? lead.proposed_budget : undefined,
    main_sales: main_sales.filter(Boolean),
    offline_sales: offline_sales.filter(Boolean)
  };
}
