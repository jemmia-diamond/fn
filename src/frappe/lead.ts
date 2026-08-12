import FrappeClient from "src/frappe/frappe-client";
import { IFrappeLead } from "src/services/larksuite/appointment/types";
import { normalizeToStandardFormat } from "src/services/utils/phone-utils";

export async function fetchLeadInfoByPhoneNumber(
  frappeClient: FrappeClient,
  phoneNumber: string
) {
  if (!phoneNumber) return null;

  const normalizedPhone = normalizeToStandardFormat(phoneNumber);
  const trimmedPhone = phoneNumber.trim();
  const or_filters: any[] = [["phone", "=", trimmedPhone], ["phone", "=", normalizedPhone]];
  if (trimmedPhone.startsWith("84")) {
    or_filters.push(["phone", "=", `0${trimmedPhone.slice(2)}`]);
  }

  const lead: IFrappeLead[] = await frappeClient.getList("Lead", { fields: ["name"], or_filters });
  return lead?.length ? await frappeClient.getDoc("Lead", lead[0].name) : null;
}
