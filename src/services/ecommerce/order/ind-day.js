export default class IndDayService {
  constructor(env) {
    this.env = env;
    this.indDayProductId = 1062559389; // Product ID for Independent Day
    this.countOrderKey = "count_order"; // Key for counting orders
    this.countProductQuantityKey = "count_product_quantity"; // Key for counting product quantity
    this.productQuantityBudget = 250; // Budget for product quantity
  }

  static async trackBudget(batch, env) {
    try {
      const lineItems = batch.messages[0].body.line_items;
      const indDayService = new IndDayService();

      const matchingItems = lineItems.filter((item) => item.product_id === indDayService.indDayProductId);
      const count = matchingItems.length;
      const totalQuantity = matchingItems.reduce((sum, item) => sum + item.quantity, 0);

      const countOrder = await env.FN_KV.get(indDayService.countOrderKey) || 0;
      const countProductQuantity = await env.FN_KV.get(indDayService.countProductQuantityKey) || 0;
      const newOrderCount = parseInt(countOrder) + count;
      const newQuantityCount = parseInt(countProductQuantity) + totalQuantity;

      await env.FN_KV.put(indDayService.countOrderKey, newOrderCount);
      if (newQuantityCount < this.productQuantityBudget) {
        await env.FN_KV.put(indDayService.countProductQuantityKey, newQuantityCount);
      } else {
        console.warn(`Product quantity budget exceeded, limit is ${this.productQuantityBudget}`);
      }
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
