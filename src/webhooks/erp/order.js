export default class Order {
    static async create(ctx) {
        // Receives the order events from haravan and sends them to the order queue
        const data = await ctx.req.json();
        try {
            await ctx.env["ORDER_QUEUE"].send(data);
            return ctx.json({ message: "Message sent to queue", status: 200 });
        } catch (e) {
            console.error(e);
            return ctx.json({ message: e.message, status: 500 });
        };
    };
};