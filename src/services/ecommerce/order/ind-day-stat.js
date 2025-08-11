import { HARAVAN_TOPIC } from "services/ecommerce/enum";

export default class IndDayStatService {
  constructor(env) {
    this.env = env;
    this.indDayProductId = 1062559389; // Product ID for Independent Day
    this.countOrderKey = "count_order"; // Key for counting orders
    this.countProductQuantityKey = "count_product_quantity"; // Key for counting product quantity
    this.productQuantityBudget = 250; // Budget for product quantity
  }

  static async trackBudget(batch, env) {
    try {
      if (!batch?.messages?.length) {
        return;
      }
      const { line_items: lineItems = [], haravan_topic, cancelled_at } = batch.messages[0].body;
      const indDayStatService = new IndDayStatService();

      const totalQuantity = lineItems.reduce(
        (sum, item) =>
          item.product_id === indDayStatService.indDayProductId
            ? sum + item.quantity
            : sum,
        0
      );

      const kvValues = await env.FN_KV.get([
        indDayStatService.countOrderKey,
        indDayStatService.countProductQuantityKey
      ]);
      const { count_order, count_product_quantity} = Object.fromEntries(kvValues);

      let newOrderCount = parseInt(count_order) || 0;
      let newQuantityCount = parseInt(count_product_quantity) || 0;

      if (haravan_topic === HARAVAN_TOPIC.CREATED) {
        newOrderCount ++;
        newQuantityCount += totalQuantity;
      } else if (haravan_topic === HARAVAN_TOPIC.UPDATED && cancelled_at) {
        newOrderCount --;
        newQuantityCount -= totalQuantity;
      }

      if (newQuantityCount > indDayStatService.productQuantityBudget) {
        throw new Error("Product quantity budget exceeded");
      }
      await env.FN_KV.put(indDayStatService.countOrderKey, newOrderCount);
      await env.FN_KV.put(indDayStatService.countProductQuantityKey, newQuantityCount);

    } catch (error) {
      console.error("Error tracking budget:", error);
      throw error;
    }
  }

  async getStats() {
    try {
      const countOrder = await this.env.FN_KV.get(this.countOrderKey);
      const countProductQuantity = await this.env.FN_KV.get(this.countProductQuantityKey);
      if (countOrder === null || countProductQuantity === null) {
        throw new Error("Data is missing keys");
      }
      return {
        count_order: countOrder,
        count_product_quantity: countProductQuantity
      };
    } catch (error) {
      console.error("Error checking budget:", error);
      throw error;
    }
  }

  async reset() {
    try {
      await this.env.FN_KV.delete(this.countOrderKey);
      await this.env.FN_KV.delete(this.countProductQuantityKey);
    } catch (error) {
      console.error("Error resetting budget:", error);
      throw error;
    }
  }
}
