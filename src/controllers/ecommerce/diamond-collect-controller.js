export default class DiamondCollectController {
  static async create(ctx) {
    await ctx.env.PROMOTION_DIAMOND_COLLECT_SYNC_QUEUE.send({
      type: "sync_promotion_diamonds_to_collects",
      timestamp: new Date().toISOString()
    });
    return ctx.json({
      success: true,
      message: "Diamond collection sync task enqueued successfully"
    }, 200);
  }
}
