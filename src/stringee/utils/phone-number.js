export const normalizePhoneNumber = (phone) => {
  if (phone.length === 11 && phone.startsWith("84")) {
    return "0" + phone.slice(2);
  }
  return phone;
};
