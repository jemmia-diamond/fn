import orderService from "../../services/jemmia_erp/order";

export default class orderController {
    static async haravanWebhook(ctx) {
        // Receives the order events from haravan and sends them to the order queue
        const environment = ctx.env.ENV === "dev" ? "_DEV" : "";
        const data = await ctx.req.json();
        try {
            await ctx.env[`ORDER_QUEUE${environment}`].send(data);
            return ctx.json({ message: 'Message sent to queue', status: 200 });
        } catch (e) {
            console.error(e);
            return ctx.json({ message: e.message, status: 500 });
        }
    }

    static async create(ctx) {
        const orderData = await ctx.req.json();
        const orderSer = new orderService(ctx.env);
        const order = await orderSer.processHaravanOrder(orderData);
        return ctx.json(order, 200);
    }
}
