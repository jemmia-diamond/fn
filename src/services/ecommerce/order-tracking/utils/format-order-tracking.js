export function formatOrderTrackingResult(order, nhattinTrackInfo) {
  return {
    order_id: order.id,
    total_price: Number(order.total_price || 0),
    original_total_price: Number(order.original_total_price || 0),
    shipping_fee: Number(order.shipping_fee || 0),
    items: order.items || [],
    tracking_logs: nhattinTrackInfo.status,
    expected_receive_date: convertToUTC(nhattinTrackInfo.date_expected),
    shipping_address_name: order.shipping_address_name,
    shipping_address_phone: order.shipping_address_phone,
    shipping_address_city: order.shipping_address_city,
    shipping_address_district: order.shipping_address_district,
    shipping_address_ward: order.shipping_address_ward,
    shipping_address_province: order.shipping_address_province,
    payment_method: order.payment_method,
    confirmed_date: order.order_date,
    paid_date: order.payment_date,
    completed_date: convertToUTC(nhattinTrackInfo.date_delivery),
    note: order.note,
    cancel_reason: order.cancel_reason,
    overall_status: nhattinTrackInfo.overall_status,
    p_link_image: nhattinTrackInfo.p_link_image,
    bill_image_link: nhattinTrackInfo.bill_image_link,
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
    return "Chuyển phát nhánh";
  }
  return shippingType;
}

function convertToUTC(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString();
}
