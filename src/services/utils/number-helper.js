export function numberToCurrency(number, locale = "vi-VN") {
  return number.toLocaleString(locale);
}
