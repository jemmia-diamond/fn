export function formatOrderTrackingResult(order, nhattinTrackInfo, isAuthorizedAccess = false) {
  return {
    order_id: order.order_id.toString(),
    order_number: order.order_number,
    total_price: Number(order.total_price || 0),
    original_total_price: Number(order.original_total_price || 0),
    shipping_fee: Number(order.shipping_fee || 0),
    items: isAuthorizedAccess ? (order.items || []).map(normalizeDiamondItem) : [],
    tracking_logs: nhattinTrackInfo?.status || [],
    expected_receive_date: convertToUTC(nhattinTrackInfo.date_expected),
    shipping_address_name: isAuthorizedAccess ? order.shipping_address_name : maskExceptFirstAndLast(order.shipping_address_name),
    shipping_address_phone: isAuthorizedAccess ? order.shipping_address_phone : maskPhoneNumber(order.shipping_address_phone),
    shipping_address_city: order.shipping_address_city,
    shipping_address_district: isAuthorizedAccess ? order.shipping_address_district : maskFull(order.shipping_address_district),
    shipping_address_ward: isAuthorizedAccess ? order.shipping_address_ward : maskFull(order.shipping_address_ward),
    shipping_address_address: isAuthorizedAccess ? order.shipping_address_address1 : maskFull(order.shipping_address_address1),
    shipping_address_province: order.shipping_address_province,
    payment_method: order.payment_method,
    confirmed_date: order.order_date,
    paid_date: order.payment_date,
    completed_date: convertToUTC(nhattinTrackInfo.date_delivery),
    note: order.note,
    cancel_reason: order.cancel_reason,
    overall_status: nhattinTrackInfo.overall_status,
    p_link_image: isAuthorizedAccess ? nhattinTrackInfo.p_link_image : null,
    bill_image_link: isAuthorizedAccess ? nhattinTrackInfo.bill_image_link : null,
    document_image_link: nhattinTrackInfo.document_image_link,
    delivery_date: convertToUTC(nhattinTrackInfo.date_delivery),
    pickup_date: convertToUTC(nhattinTrackInfo.date_pickup),
    nhattin_payment_method: nhattinTrackInfo.payment_method,
    bill_code: nhattinTrackInfo.bill_code,
    ref_code: nhattinTrackInfo.ref_code,
    total_fee: nhattinTrackInfo.total_fee,
    main_fee: nhattinTrackInfo.main_fee,
    insurance_fee: nhattinTrackInfo.insurance_fee,
    cod_amt: nhattinTrackInfo.cod_amt,
    cod_fee: nhattinTrackInfo.cod_fee,
    shipping_type: mapShippingType(nhattinTrackInfo.service)
  };
}

function mapShippingType(shippingType) {
  if (shippingType === "CPN (Mes)" || shippingType === "CPN") {
    return "Chuyển phát nhanh";
  }
  return shippingType;
}

function convertToUTC(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString();
}

function maskPhoneNumber(phone) {
  if (!phone || phone.length <= 3) {
    return "***";
  }
  const lastThreeDigits = phone.slice(-3);
  const maskedPart = "*".repeat(phone.length - 3);
  return maskedPart + lastThreeDigits;
}

function maskExceptFirstAndLast(str) {
  if (!str || str.length <= 2) {
    return str || "";
  }

  const TOTAL_LENGTH = 10;
  const firstChar = str[0];
  const lastChar = str.slice(-1);

  let middlePart = "";
  if (str.length > TOTAL_LENGTH) {
    middlePart = "*".repeat(TOTAL_LENGTH - 2);
  } else {
    middlePart = "*".repeat(str.length - 2);
  }
  return `${firstChar}${middlePart}${lastChar}`;
}

function maskFull(value) {
  if (!value) {
    return "";
  }

  const TOTAL_LENGTH = 3;

  return "*".repeat(TOTAL_LENGTH);
}

function normalizeDiamondItem(item) {
  const NATURAL_DIAMOND_TITLE = "Kim Cương Tự Nhiên";
  const isNaturalDiamond = item.title.startsWith(NATURAL_DIAMOND_TITLE);

  if (!isNaturalDiamond) {
    return item;
  }
  return {
    ...item,
    title: NATURAL_DIAMOND_TITLE,
    variant_title: item.name.replace(new RegExp(`^${NATURAL_DIAMOND_TITLE}\\s*`), "")
  };
}
