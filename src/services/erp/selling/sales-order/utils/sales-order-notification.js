import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { SKU_LENGTH, SKU_PREFIX } from "services/haravan/products/product-variant/constant";
import { numberToCurrency } from "services/utils/number-helper";
import { stringSquishLarkMessage } from "services/utils/string-helper";

dayjs.extend(utc);

export const composeSalesOrderNotification = (salesOrder, promotionData, leadSource, policyData, productCategoryData, customer, primarySalesPerson, secondarySalesPeople) => {
  const orderNumber = salesOrder.order_number;

  const orderPromotionNames = salesOrder.promotions.map((promotion) => promotion.promotion);
  const orderPromotions = promotionData.filter((promotion) => orderPromotionNames.includes(promotion.name));

  const expectedPaymentDate = dayjs(salesOrder.expected_payment_date).format("DD-MM-YYYY");

  const realOrderDate = dayjs(salesOrder.real_order_date).format("DD-MM-YYYY");

  const secondarySalesPeopleNameList = secondarySalesPeople.map((salesPerson) => salesPerson.sales_person_name);

  let content = "";
  content += `
    <b>[${realOrderDate}] JEMMIA xác nhận đơn hàng #${orderNumber}</b>
  `;

  content += `
    Mã khách hàng: ${salesOrder.customer}
  `;

  salesOrder.items.map((item, idx) => {
    content += composeItemContent(item, idx + 1, promotionData.filter((promotion) => [item.promotion_1, item.promotion_2, item.promotion_3, item.promotion_4].includes(promotion.name)));
  });

  content += `
    * <b>Thông tin toàn đơn hàng</b>:
    - Tổng đơn hàng: ${numberToCurrency(salesOrder.grand_total)}
    - Ngày tư vấn: ${dayjs(salesOrder.consultation_date).format("DD-MM-YYYY")}
    - Chiết khấu đơn hàng: ${salesOrder.discount_amount}
    - Số tiền đã cọc: ${numberToCurrency(salesOrder.paid_amount || salesOrder.deposit_amount || 0)}
    - Số tiền còn lại: ${numberToCurrency(salesOrder.grand_total - (salesOrder.paid_amount || salesOrder.deposit_amount || 0))}
    - Ngày thanh toán dự kiến: ${expectedPaymentDate}
    - Kênh tiếp cận đầu tiên: ${leadSource.source_name}
    - Hành trình khách hàng: ${customer.customer_journey}
  `;

  content += `
    * <b>Đặc điểm sản phẩm đơn hàng</b>:\n${composeChildrenContent(productCategoryData, "title")}
  `;

  content += `
    * <b>Chính sách bảo hành</b>:\n${composeChildrenContent(policyData, "title")}
  `;

  const ordPromotion = orderPromotions && Array.isArray(orderPromotions) && orderPromotions.length > 0 ?
    composeChildrenContent(orderPromotions, "title")
    : " - Không";
  content += `
    * <b>Chương trình khuyến mãi toàn đơn</b>:\n${ordPromotion}
  `;

  const secondSales = secondarySalesPeopleNameList.length ?
    `\n - Phụ: ${secondarySalesPeopleNameList.join(", ")}` : "";
  content += `
    * Nhân viên phụ trách:\n- Chính: ${primarySalesPerson.sales_person_name}${secondSales}
  `;

  content += `
    * Link đơn hàng: https://erp.jemmia.vn/app/sales-order/${salesOrder.name}
  `;

  return stringSquishLarkMessage(content);
};

const composeItemContent = (item, idx, promotionData) => {
  const parentOrderInfo = `#${item.parent_order_number || "N/A"} <i>(tổng đơn: ${numberToCurrency(item.parent_grand_total || 0)})</i>`;
  if (item.sku?.startsWith(SKU_PREFIX.GIFT)) {
    return `
      ${parentOrderInfo}
      ${idx}. ${item.item_name}
      Mã gốc: ${item.variant_title}
    `;
  }

  const serialNumbers = item.serial_numbers ? item.serial_numbers.split("\n").join(", ") : "";
  const content = `
    ${parentOrderInfo}
    ${idx}. ${item.item_name}
    Mã gốc: ${extractVariantTitle(item)}
    SKU: ${item.sku}
    Số lượng: ${item.qty}
    Số serial: ${serialNumbers} 
    Giá: ${numberToCurrency(item.price_list_rate)}
    Giá khuyến mãi: ${numberToCurrency(item.rate)}
    CTKM:
    ${composeChildrenContent(promotionData, "title")}
  `;
  return content;
};

export const extractPromotions = (salesOrder) => {
  const promotionNames = [];
  const items = salesOrder.items;
  for (const item of items) {
    if (item.promotion_1) { promotionNames.push(item.promotion_1); };
    if (item.promotion_2) { promotionNames.push(item.promotion_2); };
    if (item.promotion_3) { promotionNames.push(item.promotion_3); };
    if (item.promotion_4) { promotionNames.push(item.promotion_4); };
  }

  const promotions = salesOrder.promotions;
  for (const promotion of promotions) {
    promotionNames.push(promotion.promotion);
  }
  return promotionNames;
};

export function validateOrderInfo(salesOrderData, customer) {
  let message = null;
  let isValid = false;

  if (!salesOrderData.sales_team.length) {
    message = "Chưa nhập chia doanh số";
    return { isValid, message };
  }

  if (!customer.passport_id && !customer.personal_id) {
    message = "Chưa nhập số hộ chiếu hoặc số CMND/CCCD khách hàng";
    return { isValid, message };
  }

  if (!customer.customer_journey) {
    message = "Chưa nhập hành trình khách hàng";
    return { isValid, message };
  }

  if (!customer.first_source) {
    message = "Chưa nhập mã kênh tiếp cận đầu tiên cho khách hàng";
    return { isValid, message };
  }

  if (!salesOrderData.primary_sales_person) {
    message = "Chưa nhập nhân viên phụ trách chính";
    return { isValid, message };
  }

  if (!salesOrderData.policies.length) {
    message = "Chưa nhập chính sách đơn hàng";
    return { isValid, message };
  }

  if (!salesOrderData.product_categories.length) {
    message = "Chưa nhập đặc điểm sản phẩm đơn hàng";
    return { isValid, message };
  }

  if (!salesOrderData.expected_delivery_date) {
    message = "Chưa nhập ngày giao hàng";
    return { isValid, message };
  }

  if (!salesOrderData.expected_payment_date) {
    message = "Chưa nhập ngày thanh toán";
    return { isValid, message };
  }

  if (!salesOrderData.consultation_date) {
    message = "Chưa nhập ngày tư vấn";
    return { isValid, message };
  }

  const lineItems = salesOrderData.items;

  if (lineItems.some(item => item.sku === null)) {
    message = "Chưa nhập SKU sản phẩm, vui lòng kiểm tra lại";
    return { isValid, message };
  }

  const jewelryItems = lineItems.filter((item) => (item.sku?.length === SKU_LENGTH.JEWELRY || item.sku?.startsWith(SKU_PREFIX.TEMPORARY_JEWELRY)));
  for (const jewelryItem of jewelryItems) {
    if (!jewelryItem.serial_numbers) {
      message = "Chưa nhập serial number";
      return { isValid, message };
    }
  }

  const jewelryAndDiamondItems = lineItems.filter((item) => (item.sku?.length === SKU_LENGTH.JEWELRY || item.sku?.startsWith(SKU_PREFIX.DIAMOND)));
  for (const item of jewelryAndDiamondItems) {
    if (!(item.promotion_1 || item.promotion_2 || item.promotion_3 || item.promotion_4)) {
      message = "Chưa nhập chương trình khuyến mãi cho sản phẩm trang sức hoặc kim cương";
      return { isValid, message };
    }
  }

  isValid = true;
  return { isValid, message };
}

function composeChildrenContent(children, key) {
  return children
    .map((child) => " - " + child[key])
    .join("\n");
}

function extractVariantNameForGIA(text) {
  if (typeof text !== "string") return "";
  const regex = /^(\S+)/;
  const match = text.match(regex);
  return match ? match[1] : "";
}

function extractVariantNameForJewelry(text) {
  if (typeof text !== "string") return "";
  const regex = /^(.+? - .+? - .+?) - /;
  const match = text.match(regex);
  return match ? match[1] : "";
}

export const composeOrderUpdateMessage = (prevOrder, salesOrder, promotionData) => {
  const diffAttachments = diffInAttachments(prevOrder.attachments || [], salesOrder.attachments || []);
  const lineItemMessage = composeLineItemsChangeMessage(prevOrder.items || [], salesOrder.items || [], promotionData);

  let content = "";
  if (lineItemMessage) {
    content += `${lineItemMessage}\n`;
  }

  return { content, diffAttachments };
};

const diffInAttachments = (prevAttachments, attachments) => {
  const prevAttachmentUrls = (prevAttachments || []).map((attachment) => attachment.file_url);
  const newAttachmentUrls = (attachments || []).map((attachment) => attachment.file_url);

  const addedAttachments = (attachments || []).filter(
    (attachment) => !prevAttachmentUrls.includes(attachment.file_url)
  );
  const removedAttachments = (prevAttachments || []).filter(
    (attachment) => !newAttachmentUrls.includes(attachment.file_url)
  );
  const modifiedAttachments = {};

  if (addedAttachments.length > 0) {
    modifiedAttachments.added_file = addedAttachments;
  }

  if (removedAttachments.length > 0) {
    modifiedAttachments.removed_file = removedAttachments;
  }

  return modifiedAttachments;
};

const composeLineItemsChangeMessage = (oldItems, newItems, promotionData) => {
  let message = "";
  const addedItems = newItems.filter(newItem => !oldItems.find(oldItem => oldItem.name === newItem.name));
  const removedItems = oldItems.filter(oldItem => !newItems.find(newItem => newItem.name === oldItem.name));
  const updatedItems = newItems.filter(newItem => oldItems.find(oldItem => oldItem.name === newItem.name));

  if (addedItems.length > 0) {
    message += "* <b>Sản phẩm được thêm mới: </b>\n";
    addedItems.forEach(item => {
      message += `#${item.parent_order_number || "N/A"} <i>(tổng đơn: ${numberToCurrency(item.parent_grand_total || 0)})</i>\n`;
      message += `<i>${item.item_name}</i>\n`;
      message += `Mã gốc: ${extractVariantTitle(item)}\n`;
      message += `SKU: ${item.sku}\n`;
      message += `Số lượng: ${item.qty}\n`;
      message += `Số serial: ${item.serial_numbers || "N/A"}\n`;
      message += `Giá: ${numberToCurrency(item.price_list_rate)}\n`;
      message += `Giá khuyến mãi: ${numberToCurrency(item.rate)}\n`;

      const itemPromotions = promotionData.filter((promotion) => [item.promotion_1, item.promotion_2, item.promotion_3, item.promotion_4].includes(promotion.name));
      if (itemPromotions && itemPromotions.length > 0) {
        message += "CTKM: \n";
        message += `${composeChildrenContent(itemPromotions, "title")}`;
      }
      message += "\n";
    });
    message += "\n";
  }

  if (removedItems.length > 0) {
    message += "* <b>Sản phẩm bị loại bỏ: </b>\n";
    removedItems.forEach(item => {
      message += `#${item.parent_order_number || "N/A"} <i>(tổng đơn: ${numberToCurrency(item.parent_grand_total || 0)})</i>\n`;
      message += `- ${item.item_name} (SKU: ${item.sku})\n`;
    });
    message += "\n";
  }

  if (updatedItems.length > 0) {
    let itemMessages = "";
    updatedItems.forEach(newItem => {
      const oldItem = oldItems.find(oldItem => oldItem.name === newItem.name);
      if (oldItem) {
        const changes = [];

        if (newItem.variant_title !== oldItem.variant_title) {
          changes.push(`Mã gốc: ${extractVariantTitle(oldItem)} → ${extractVariantTitle(newItem)}`);
        }
        if (newItem.sku !== oldItem.sku) {
          changes.push(`SKU: ${oldItem.sku} → ${newItem.sku}`);
        }
        if (newItem.qty !== oldItem.qty) {
          changes.push(`Số lượng: ${oldItem.qty} → ${newItem.qty}`);
        }
        if ((newItem.serial_numbers || "") !== (oldItem.serial_numbers || "")) {
          changes.push(`Số serial: ${oldItem.serial_numbers || "N/A"} → ${newItem.serial_numbers || "N/A"}`);
        }
        if (newItem.price_list_rate !== oldItem.price_list_rate) {
          changes.push(`Giá: ${numberToCurrency(oldItem.price_list_rate)} → ${numberToCurrency(newItem.price_list_rate)}`);
        }
        if (newItem.rate !== oldItem.rate) {
          changes.push(`Giá khuyến mãi: ${numberToCurrency(oldItem.rate)} → ${numberToCurrency(newItem.rate)}`);
        }

        // Promotions
        const oldPromotions = [oldItem.promotion_1, oldItem.promotion_2, oldItem.promotion_3, oldItem.promotion_4].filter(Boolean);
        const newPromotions = [newItem.promotion_1, newItem.promotion_2, newItem.promotion_3, newItem.promotion_4].filter(Boolean);

        const addedPromotions = newPromotions.filter(promo => !oldPromotions.includes(promo));
        const removedPromotions = oldPromotions.filter(promo => !newPromotions.includes(promo));

        if (addedPromotions.length > 0 || removedPromotions.length > 0) {
          let promotionChanges = "";
          if (newPromotions.length > 0) {
            promotionChanges += "CTKM: \n";
            promotionChanges += `${composeChildrenContent(promotionData.filter((promotion) => newPromotions.includes(promotion.name)), "title")}\n`;
          }
          changes.push(promotionChanges.trim());
        }

        if (changes.length > 0) {
          const parentOrderInfo = `#${newItem.parent_order_number || "N/A"} <i>(tổng đơn: ${numberToCurrency(newItem.parent_grand_total || 0)})</i>`;
          changes.unshift(`<i>${newItem.item_name} - ${newItem.variant_title}</i>`);
          changes.unshift(parentOrderInfo);
          changes.forEach(change => {
            itemMessages += `${change}\n`;
          });
          itemMessages += "\n";
        }
      }
    });

    if (itemMessages) {
      message += "* <b>Sản phẩm được cập nhật:</b>\n";
      message += itemMessages;
      message += "\n";
    }
  }

  return message;

};

const extractVariantTitle = (item) => {
  const title = item?.variant_title || "";
  const extracted = item.sku?.startsWith(SKU_PREFIX.DIAMOND) || item.sku?.startsWith(SKU_PREFIX.DIAMOND_TEMPORARY)
    ? extractVariantNameForGIA(title)
    : extractVariantNameForJewelry(title);

  return extracted || title || "N/A";
};

/**
 * Find main order that contains only gift or jewelry items
 * @param {*} orders
 * @returns {{mainOrder: *, subOrders: *[]}}
 */
export const findMainOrder = (orders) => {
  let mainOrder = orders.find(order => isPrimaryOrder(order));
  if (!mainOrder) {
    mainOrder = orders[0];
  }
  const subOrders = orders.filter(order => order.name !== mainOrder.name);
  return {
    mainOrder,
    subOrders
  };
};

/**
 * Check if a sales order is primary order that contains only gift or jewelry items
 * @param {*} salesOrder
 * @returns {boolean}
 */
const isPrimaryOrder = (salesOrder) => {
  const items = salesOrder.items || [];
  return items.every(
    (item) =>
      item.sku?.startsWith(SKU_PREFIX.GIFT)
    || item.sku?.startsWith(SKU_PREFIX.TEMPORARY_JEWELRY)
    || item.sku?.length === SKU_LENGTH.JEWELRY
  );
};
