const PHONE_NUMBER_LENGTH_WITH_COUNTRY_CODE = 11;
const VIETNAM_COUNTRY_CODE = "84";
const VIETNAM_PHONE_PREFIX = "0";

export const normalizePhoneNumber = (phone) => {
  if (phone.length === PHONE_NUMBER_LENGTH_WITH_COUNTRY_CODE && phone.startsWith(VIETNAM_COUNTRY_CODE)) {
    return VIETNAM_PHONE_PREFIX + phone.slice(2);
  }
  return phone;
};
