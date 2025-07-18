import SalesOrderService from "../../services/erp/selling/sales-order/sales-order";

export default class SalesOrderController {
  static async create(ctx) {
    const orderData = await ctx.req.json();
    const salesOrderService = new SalesOrderService(ctx.env);
    const order = await salesOrderService.processHaravanOrder(orderData);
    return ctx.json(order, 200);
  };
};
