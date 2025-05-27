import OrderService from "../../services/erp/order";

export default class OrderController {
    static async create(ctx) {
        const orderData = await ctx.req.json();
        const orderSer = new OrderService(ctx.env);
        const order = await orderSer.processHaravanOrder(orderData);
        return ctx.json(order, 200);
    };
};
