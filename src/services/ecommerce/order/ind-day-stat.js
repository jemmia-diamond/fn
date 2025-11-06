import * as Sentry from "@sentry/cloudflare";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";

export default class IndDayStatService {
  constructor(env) {
    this.env = env;
    this.indDayProductIds = [1069557862]; // Mock Product IDs for Independent Day
    this.countProductQuantityKey = "count_product_quantity"; // Key for counting product quantity
    this.productQuantityBudget = 290; // Budget for product quantity
  }

  static async trackBudget(batch, env) {
    try {
      const { line_items, haravan_topic, cancelled_status, cancelled_at, updated_at, partially_paid } = batch.messages[0].body;

      if ( partially_paid !== "partially_paid" ) return;

      const indDayStatService = new IndDayStatService();
      const totalQuantity = Object.values(line_items).reduce(
        (sum, item) =>
          indDayStatService.indDayProductIds.includes(item.product_id)
            ? sum + item.quantity
            : sum,
        0
      );

      const productQuantity = await env.FN_KV.get(indDayStatService.countProductQuantityKey);

      let newQuantityCount = parseInt(productQuantity) || 0;

      if (haravan_topic === HARAVAN_TOPIC.CREATED) {
        newQuantityCount += totalQuantity;
      } else if (haravan_topic === HARAVAN_TOPIC.UPDATED && cancelled_status === "cancelled" ) {
        const cancelledAt = new Date(cancelled_at);
        const updatedAt = new Date(updated_at);
        if (updatedAt.getTime() - cancelledAt.getTime() < 2000) {
          newQuantityCount -= totalQuantity;
        }
      }

      if (newQuantityCount > indDayStatService.productQuantityBudget) {
        console.warn("Product quantity budget exceeded");
      }
      await env.FN_KV.put(indDayStatService.countProductQuantityKey, newQuantityCount);

    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getStats() {
    try {
      const productQuantity = await this.env.FN_KV.get(this.countProductQuantityKey);
      if (productQuantity === null) {
        throw new Error("Data is missing keys");
      }

      return {
        count_product_quantity: Number(productQuantity) + (Number(this.env.STATS_NUMBER_BUFFER) || 0)
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async reset() {
    try {
      await this.env.FN_KV.delete(this.countProductQuantityKey);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
}
