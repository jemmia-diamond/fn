export function getFinancialStatus(status) {
  if (status === null || status === undefined || status === "") {
    return "Không xác định";
  }

  switch (String(status).toLowerCase()) {
  case "pending":
    return "Chờ xác nhận";
  case "authorized":
    return "Đã ủy quyền";
  case "partially_paid":
    return "Đã thanh toán một phần";
  case "paid":
    return "Đã thanh toán";
  case "partially_refunded":
    return "Đã hoàn tiền một phần";
  case "refunded":
    return "Đã hoàn tiền";
  case "voided":
    return "Đã hủy thanh toán";
  case "open":
    return "Chờ xử lý";
  case "cancelled":
    return "Đã hủy";
  default:
    return "Không xác định";
  }
}
