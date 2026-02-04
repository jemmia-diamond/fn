import FrappeClient from "src/frappe/frappe-client";

export default class LarkApprovalOrdersController {
  static async create(ctx) {
    try {
      const { token, linkage_params } = await ctx.req.json() || {};

      const expectedToken = await ctx.env.BEARER_TOKEN_SECRET.get();
      if (token !== expectedToken) {
        return ctx.json({
          code: 1,
          msg: "invalid token",
          data: {}
        });
      }

      const frappeClient = new FrappeClient({
        url: ctx.env.JEMMIA_ERP_BASE_URL,
        apiKey: ctx.env.JEMMIA_ERP_API_KEY,
        apiSecret: ctx.env.JEMMIA_ERP_API_SECRET
      });

      const filters = [["docstatus", "!=", 2]];

      if (linkage_params && linkage_params.phone) {
        filters.push(["contact_phone", "like", `%${linkage_params.phone}%`]);
      }

      const orders = await frappeClient.getList("Sales Order", {
        fields: ["name", "customer", "grand_total", "currency", "transaction_date"],
        filters: filters,
        order_by: "creation desc",
        limit_page_length: 50
      });

      const options = orders.map(order => {
        const id = order.name;
        const value = id;
        return {
          id,
          value,
          isDefault: false
        };
      });

      const texts = {};
      orders.forEach(order => {
        const key = order.name;
        const formattedTotal = new Intl.NumberFormat("vi-VN", { style: "currency", currency: order.currency || "VND" }).format(order.grand_total);
        const label = `${order.name} - ${order.customer} - ${formattedTotal} (${order.transaction_date})`;
        texts[key] = label;
      });

      const i18nResources = [
        {
          locale: "en_us",
          isDefault: true,
          texts
        },
        {
          locale: "vi_vn",
          isDefault: false,
          texts
        }
      ];

      return ctx.json({
        code: 0,
        msg: "success",
        data: {
          result: {
            options,
            i18nResources
          }
        }
      });

    } catch (e) {
      console.warn(e);
      return ctx.json({
        code: 3,
        msg: "internal error: " + e.message,
        data: {}
      });
    }
  }
};
