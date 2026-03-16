export function getFulfillmentStatus(status) {
  if (status === null || status === undefined || status === "") {
    return "Chưa giao hàng";
  }

  switch (String(status).toLowerCase()) {
  case "notfulfilled":
    return "Chưa giao hàng";
  case "fulfilled":
    return "Đã giao hàng";
  case "partial":
    return "Giao một phần";
  case "restocked":
    return "Đã hoàn kho";
  default:
    return "Không xác định";
  }
}

