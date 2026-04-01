import { parsePhoneNumberFromString, getCountryCallingCode } from "libphonenumber-js";

export function normalizeToStandardFormat(phone, defaultCountry = "VN") {
  if (!phone) return "";

  const phoneNumber = parsePhoneNumberFromString(phone, defaultCountry);
  if (phoneNumber && phoneNumber.isValid()) {
    return phoneNumber.format("E.164").replace("+", "");
  }

  let digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  let countryCode;
  try {
    countryCode = getCountryCallingCode(defaultCountry);
  } catch {
    countryCode = "84";
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return countryCode + digits.slice(1);
  }

  if (digits.startsWith(countryCode + "0") && digits.length >= countryCode.length + 9) {
    return countryCode + digits.slice(countryCode.length + 1);
  }

  return digits;
}
