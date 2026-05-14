import { normalizeToStandardFormat } from "services/utils/phone-utils";

export function normalizePageCustomerPhone(raw) {
  if (raw == null || raw === "") return null;
  const s = typeof raw === "string" ? raw : String(raw);
  const n = normalizeToStandardFormat(s);
  return n || null;
}

export function normalizePageCustomerPhoneNumbers(phoneNumbersJson) {
  if (!Array.isArray(phoneNumbersJson) || phoneNumbersJson.length === 0) return null;
  const out = [];
  for (const item of phoneNumbersJson) {
    if (typeof item !== "string") continue;
    const n = normalizeToStandardFormat(item);
    if (n) out.push(n);
  }
  return out.length ? out : null;
}
