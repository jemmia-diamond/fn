import { Context } from "hono";
import { RetouchToHaravanService } from "services/workplace/design-images";

export default class DesignImagesRetouchToHaravanController {
  static async handle(ctx: Context) {
    const payload = await ctx.req.json();

    try {
      const service = new RetouchToHaravanService(ctx.env as any);
      await service.sync(payload);
      return ctx.json({ message: "OK" }, { status: 200 });
    } catch (err: any) {
      return ctx.json({ message: err.message }, { status: 400 });
    }
  }
}
