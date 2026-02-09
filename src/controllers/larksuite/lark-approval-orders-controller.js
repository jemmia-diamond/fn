import ApprovalOrderService from "services/larksuite/approval/approval-order-service";

export default class LarkApprovalOrdersController {
  static async create(ctx) {
    try {
      const { token, linkage_params } = await ctx.req.json() || {};

      const expectedToken = await ctx.env.BEARER_TOKEN_SECRET.get();
      if (token !== expectedToken) {
        return ctx.json({
          code: 1,
          msg: "invalid token",
          data: {}
        });
      }

      const service = new ApprovalOrderService(ctx.env);
      const { options, i18nResources } = await service.searchOrders(linkage_params);

      return ctx.json({
        code: 0,
        msg: "success",
        data: {
          result: {
            options,
            i18nResources
          }
        }
      });

    } catch (e) {
      console.warn(e);
      return ctx.json({
        code: 3,
        msg: "internal error: " + e.message,
        data: {}
      });
    }
  }
};
