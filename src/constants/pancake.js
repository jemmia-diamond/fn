export const PROMO_KEYWORDS = [
  "siêu sale",
  "black friday",
  "ưu đãi",
  "chương trình",
  "trúng thưởng",
  "đại lễ rộn ràng",
  "tri ân",
  "mời quý khách hàng",
  "quà tặng",
  "chúc mừng",
  "chúc mừng sinh nhật",
  "năm mới",
  "chúc chị",
  "lời mời",
  "quà noel",
  "ctkm",
  "sự kiện",
  "sinh nhật",
  "ngày đặc biệt",
  "nhân dịp",
  "lời chúc",
  "ra mắt",
  "dịp đầu năm",
  "cơ hội trúng",
  "vòng quay",
  "voucher giảm riêng",
  "siêu deal",
  "đặc quyền riêng"
];

// Pre-compiled case-insensitive regex for better performance
export const PROMO_REGEX = new RegExp(PROMO_KEYWORDS.join("|"), "i");
