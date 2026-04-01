import parsePhoneNumber from "libphonenumber-js";

/**
 * Normalizes phone numbers to a standardized format (E.164 without the + prefix).
 * Uses libphonenumber-js for robust global parsing and formatting.
 *
 * @param {string} phone - The raw phone number string.
 * @param {string} [defaultCountry="VN"] - The default country code for local numbers.
 * @returns {string} The normalized phone number (digits only, starting with country code).
 */
export function normalizeToStandardFormat(phone, defaultCountry = "VN") {
  if (!phone) return "";

  const phoneNumber = parsePhoneNumber(phone, defaultCountry);
  if (phoneNumber && phoneNumber.isValid()) {
    return phoneNumber.format("E.164").replace("+", "");
  }

  return phone.replace(/\D/g, "");
}
