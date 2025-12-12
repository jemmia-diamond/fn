export default class ZalopayTransactionWebhook {
  static async register(webhook) {
    const zalopayWebhookNamespace = webhook.basePath("/zalopay");
    zalopayWebhookNamespace.post("/transactions", ZalopayTransactionWebhook.receive);
  }

  static async receive(ctx) {
    try {
      const body = await ctx.req.json();
      const { data: dataStr } = body || {};

      console.warn("Received Zalopay transaction webhook:", JSON.stringify(body, null, 2));

      if (dataStr) {
        try {
          const parsedData = JSON.parse(dataStr);
          console.warn("Parsed Zalopay Data:", JSON.stringify(parsedData, null, 2));
        } catch (error) {
          console.warn("Failed to parse Zalopay data string:", error);
        }
      }

      return ctx.json({ message: "Received" });
    } catch (e) {
      return ctx.json({ message: e.message, status: 500 });
    }
  }
}
