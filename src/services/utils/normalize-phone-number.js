export default function normalizePhoneNumber(phone) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  return digits.replace(/^(1|01|44|61|81|82|84|86)/, "");
}
