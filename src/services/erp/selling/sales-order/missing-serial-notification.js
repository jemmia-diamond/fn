import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { isMissingJewelrySerial, isJewelryItem, isDiamondItem } from "services/erp/selling/sales-order/utils/sales-order-notification";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
export default class MissingSerialNotificationService {
  constructor(env) {
    this.env = env;
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  async notify(options = {}) {
    const { fromDate, toDate } = options;

    const filters = [
      ["cancelled_status", "=", "Uncancelled"],
      ["grand_total", ">", 1000],
      ["source_name", "!=", "web"]
    ];

    if (fromDate && toDate) {
      filters.push(["real_order_date", ">=", dayjs(fromDate).format("YYYY-MM-DD")]);
      filters.push(["real_order_date", "<=", dayjs(toDate).format("YYYY-MM-DD")]);
    }

    let limit_start = 0;
    const limit_page_length = 100;
    let hasMore = true;
    const ordersWithIssues = [];

    while (hasMore) {
      const salesOrders = await this.frappeClient.getList("Sales Order", {
        filters,
        fields: ["name", "order_number", "customer_name", "primary_sales_person"],
        order_by: "creation desc",
        limit_start,
        limit_page_length
      });

      if (!salesOrders || salesOrders.length === 0) {
        hasMore = false;
        break;
      }

      for (const order of salesOrders) {
        const fullOrder = await this.frappeClient.getDoc("Sales Order", order.name);
        const items = fullOrder.items || [];

        const missingSerialItems = items.filter(isMissingJewelrySerial);

        const missingPromotionItems = items.filter(item => {
          if (!isJewelryItem(item) && !isDiamondItem(item)) return false;

          // Check if there is a price difference (meaning it was discounted)
          const priceDiff = Math.abs((item.price_list_rate || 0) - (item.rate || 0));
          if (priceDiff <= 5000) return false;

          // Check if new_promotions is empty, "[]", or {}
          if (!item.new_promotions) return true;
          try {
            const parsed = typeof item.new_promotions === "string" ? JSON.parse(item.new_promotions) : item.new_promotions;
            if (Array.isArray(parsed) && parsed.length === 0) return true;
            if (parsed && typeof parsed === "object" && Object.keys(parsed).length === 0) return true;
          } catch {
            if (typeof item.new_promotions === "string" && item.new_promotions.trim() === "[]") return true;
          }

          return false;
        });

        const isOrderMissingPromotion = (fullOrder.discount_amount || 0) > 5000 && (!fullOrder.promotions || fullOrder.promotions.length === 0);

        if (missingSerialItems.length > 0 || missingPromotionItems.length > 0 || isOrderMissingPromotion) {
          const larkUserId = await this.getLarkUserIdBySalesPerson(order.primary_sales_person);
          ordersWithIssues.push({
            name: order.name,
            order_number: order.order_number,
            larkUserId,
            missingSerialItems,
            missingPromotionItems,
            isOrderMissingPromotion
          });
        }
      }

      if (salesOrders.length < limit_page_length) {
        hasMore = false;
      } else {
        limit_start += limit_page_length;
      }
    }

    if (ordersWithIssues.length === 0) return;

    const message = this.formatMessage(ordersWithIssues, fromDate, toDate);

    const larkClient = await LarksuiteService.createClientV2(this.env);
    await larkClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: CHAT_GROUPS.CUSTOMER_INFO.chat_id,
        msg_type: "text",
        content: JSON.stringify({ text: message })
      }
    });
  }

  async getLarkUserIdBySalesPerson(salesPersonName) {
    if (!salesPersonName) return null;
    const salesPerson = await this.frappeClient.getDoc("Sales Person", salesPersonName);
    if (!salesPerson?.employee_email) return null;
    const user = await this.db.larksuite_users.findFirst({
      where: {
        OR: [
          { email: salesPerson.employee_email },
          { enterprise_email: salesPerson.employee_email }
        ]
      },
      select: { user_id: true }
    });
    return user?.user_id || null;
  }

  formatMessage(ordersWithIssues, fromDate, toDate) {
    let dateStr = "";
    if (fromDate && toDate) {
      const from = dayjs(fromDate).utcOffset(7).format("DD/MM/YYYY");
      const to = dayjs(toDate).utcOffset(7).format("DD/MM/YYYY");
      dateStr = `Từ ngày ${from} đến ngày ${to}, c`;
    } else {
      dateStr = "C";
    }
    let message = `⚠️ ${dateStr}ó ${ordersWithIssues.length} đơn hàng cần bổ sung thông tin (Serial/CTKM) ⚠️\n`;

    ordersWithIssues.forEach((order, idx) => {
      const link = `https://erp.jemmia.vn/desk/sales-order/${order.name}`;
      message += `\n<b>${idx + 1}. #${order.order_number || order.name}</b>`;

      if (order.missingSerialItems.length > 0) {
        message += "\n* Sản phẩm thiếu serial:";
        order.missingSerialItems.forEach((item) => {
          message += `\n - ${item.item_name || item.sku} (SKU: ${item.sku})`;
        });
      }

      if (order.missingPromotionItems.length > 0) {
        message += "\n* Sản phẩm thiếu CTKM:";
        order.missingPromotionItems.forEach((item) => {
          message += `\n - ${item.item_name || item.sku} (SKU: ${item.sku})`;
        });
      }

      if (order.isOrderMissingPromotion) {
        message += "\n* Đơn hàng thiếu CTKM (áp dụng cho toàn đơn)";
      }

      message += `\n - Link: ${link}`;
      if (order.larkUserId) {
        message += `\n\n<at user_id="${order.larkUserId}"></at>\nVui lòng bổ sung thông tin còn thiếu!`;
      }
      message += "\n";
    });

    return message;
  }
}
