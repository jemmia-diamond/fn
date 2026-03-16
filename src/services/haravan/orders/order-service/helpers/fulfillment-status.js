export function getFulfillmentStatus(status) {
  const key = String(status ?? "").trim().toLowerCase();

  const map = {
    notfulfilled: "Chưa giao hàng",
    fulfilled: "Đã giao hàng",
    partial: "Giao một phần",
    restocked: "Đã hoàn kho"
  };

  return map[key] ?? "Không xác định";
}
