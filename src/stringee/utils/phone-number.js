const PHONE_NUMBER_LENGTH = 10;
const VIETNAM_COUNTRY_CODE = "84";
const VIETNAM_PHONE_PREFIX = "0";

export const normalizePhoneNumber = (phone) => {
  if (phone.length === PHONE_NUMBER_LENGTH + 1 && phone.startsWith(VIETNAM_COUNTRY_CODE)) {
    return VIETNAM_PHONE_PREFIX + phone.slice(2);
  }
  if (phone.length === PHONE_NUMBER_LENGTH - 1 && !phone.startsWith(VIETNAM_PHONE_PREFIX)) {
    return `${VIETNAM_COUNTRY_CODE}${phone}`;
  }
  return phone;
};
