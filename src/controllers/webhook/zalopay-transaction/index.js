import Database from "services/database";

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

          let embedDataJson = null;
          let itemJson = null;

          try {
            embedDataJson = parsedData.embed_data ? JSON.parse(parsedData.embed_data) : null;
          } catch (e) {
            console.warn("Failed to parse embed_data", e);
          }

          try {
            itemJson = parsedData.item ? JSON.parse(parsedData.item) : null;
          } catch (e) {
            console.warn("Failed to parse item", e);
          }

          const db = Database.instance(ctx.env);
          await db.sepay_transaction.create({
            data: {
              id: parsedData.app_trans_id,
              app_id: parsedData.app_id,
              app_trans_id: parsedData.app_trans_id,
              app_time: parsedData.app_time,
              app_user: parsedData.app_user,
              amount: parsedData.amount,
              embed_data: embedDataJson,
              item: itemJson,
              zp_trans_id: parsedData.zp_trans_id,
              server_time: parsedData.server_time,
              channel: parsedData.channel,
              merchant_user_id: parsedData.merchant_user_id,
              user_fee_amount: parsedData.user_fee_amount,
              discount_amount: parsedData.discount_amount
            }
          });
        } catch (error) {
          console.warn("Failed to process Zalopay data:", error);
        }
      }

      return ctx.json({ message: "Received" });
    } catch (e) {
      return ctx.json({ message: e.message, status: 500 });
    }
  }
}
