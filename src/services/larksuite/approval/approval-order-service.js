import Database from "services/database";

export default class ApprovalOrderService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async searchOrders(linkageParams) {
    let whereClause = {};

    if (linkageParams && linkageParams.ORDER_CODE) {
      const orderCodeRaw = String(linkageParams.ORDER_CODE);
      const orderNumber = orderCodeRaw.replace(/\D/g, "");

      if (orderNumber) {
        whereClause = {
          order_number: {
            contains: orderNumber
          }
        };
      }
    }

    const orders = await this.db.order.findMany({
      where: whereClause,
      orderBy: {
        created_at: "desc"
      },
      take: 20
    });

    return this.mapOrdersToOptions(orders);
  }

  mapOrdersToOptions(orders) {
    const options = orders.map(order => {
      const id = order.order_number;
      const value = order.order_number;
      return {
        id,
        value,
        isDefault: false
      };
    });

    const texts = {};
    orders.forEach(order => {
      const key = order.order_number;

      let label = `Order #${order.order_number}`;

      const customerName = [order.customer_last_name, order.customer_first_name].filter(Boolean).join(" ");
      if (customerName) {
        label += ` - ${customerName}`;
      }

      if (order.financial_status) {
        label += ` - ${order.financial_status}`;
      }

      if (order.created_at) {
        const dateStr = new Date(order.created_at).toISOString().split("T")[0];
        label += ` (${dateStr})`;
      }

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

    return {
      options,
      i18nResources
    };
  }
}
