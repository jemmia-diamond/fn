export function getFinancialStatus(status) {
  const key = String(status ?? "").trim().toLowerCase();

  const map = {
    pending: "Chờ xác nhận",
    authorized: "Đã ủy quyền",
    partially_paid: "Đã thanh toán một phần",
    paid: "Đã thanh toán",
    partially_refunded: "Đã hoàn tiền một phần",
    refunded: "Đã hoàn tiền",
    voided: "Đã hủy thanh toán",
    open: "Chờ xử lý",
    cancelled: "Đã hủy"
  };

  return map[key] ?? "Không xác định";
}
