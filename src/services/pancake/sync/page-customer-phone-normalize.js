import { normalizeToStandardFormat } from "services/utils/phone-utils";

export function normalizePageCustomerPhone(raw) {
  if (!raw) return null;

  const s = String(raw);
  const n = normalizeToStandardFormat(s);
  return n || null;
}

export function normalizePageCustomerPhoneNumbers(phoneNumbersJson) {
  if (!Array.isArray(phoneNumbersJson) || !phoneNumbersJson.length) {
    return null;
  }

  const out = phoneNumbersJson
    .map(item => typeof item === "string" ? normalizeToStandardFormat(item) : null)
    .filter(Boolean);

  return out.length ? out : null;
}
