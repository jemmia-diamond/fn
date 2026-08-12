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
  lgbt: "LGBT"
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
  const mapPreferredProducts = (items: any[]) => {
    if (!items?.length) return [];
    return items.map((item) => ({ product_type: item.product_type }));
  };

  const main_sales = (dataRequest.main_sales || []).map(mapSalesPerson);
  const offline_sales = (dataRequest.offline_sales || []).map(mapSalesPerson);
  const fields: Record<string, any> = {
    customer_name: dataRequest.name || "Khách hàng",
    customer_phone_number: lead?.phone || dataRequest.phone_number,
    scheduled_time: scheduledTime,
    order_status: dataRequest.order_status || "Khách hẹn đến cửa hàng",
    status: dataRequest.status,
    store: dataRequest.store,
    gender,
    conversation_greeting: dataRequest.conversation_greeting,
    notes: [
      dataRequest.note ? `Lưu ý đặc biệt \n ${dataRequest.note}` : "",
      dataRequest.conversation_greeting ? `Nội dung đón tiếp tại cửa hàng \n ${dataRequest.conversation_greeting}` : ""
    ].filter(Boolean).join("\n\n"),
    customer_response: dataRequest.customer_response,
    record_id: dataRequest.record_id,
    policy: dataRequest.policy,
    primary_sales: main_sales.filter(Boolean)?.[0]?.sales_person,
    main_sales: main_sales.filter(Boolean),
    offline_sales: offline_sales.filter(Boolean),
    budget: dataRequest.budget,
    offline_response: dataRequest.offline_response
  };

  if (lead) {
    fields.estimated_budget = lead.budget_lead;
    fields.range_estimated_budget = lead.budget_lead;
    fields.appointment_with = lead.doctype;
    fields.party = lead.name;
    fields.purchased_purpose = lead.purpose_lead;
    fields.preferred_products = mapPreferredProducts(lead.preferred_product_type);
  }

  return fields;
}
