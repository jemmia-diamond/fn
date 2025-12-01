export function getFinancialStatus(status) {
  switch (status) {
  case "open": return "Chờ xử lý";
  case "paid": return "Đã thanh toán";
  case "cancelled": return "Đã hủy";
  case "refunded": return "Đã hoàn tiền";
  case "pending": return "Chờ xác nhận";
  case "partially_paid": return "Đã thanh toán một phần";
  default: return "Unknown";
  }
}
