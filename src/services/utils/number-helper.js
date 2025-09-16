export function numberToCurrency(number, locale = "vi-VN") {
  return number.toLocaleString(locale, { maximumFractionDigits: 0 }) + " VNĐ";
}
