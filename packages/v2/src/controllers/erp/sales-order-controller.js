import SalesOrderService from "src/services/erp/selling/sales-order/sales-order";

export default class SalesOrderController {
  static async create(ctx) {
    const salesOrderData = await ctx.req.json();
    const salesOrderService = new SalesOrderService(ctx.env);
    const salesOrder = await salesOrderService.processHaravanOrder(salesOrderData);
    return ctx.json(salesOrder, 200);
  };
};
