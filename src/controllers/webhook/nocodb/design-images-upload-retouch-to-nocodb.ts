import { Context } from "hono";
import { RetouchUploaderService } from "services/workplace/design-images";

export default class DesignImagesUploadRetouchToNocoDBController {
  static async handle(ctx: Context) {
    const payload = await ctx.req.json();

    const service = new RetouchUploaderService(ctx.env as any);
    await service.sync(payload);
    return ctx.json({ message: "OK" }, { status: 200 });
  }
}
