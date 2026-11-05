import RetouchToHaravanService from "services/sync/nocodb-to-haravan/design-images/retouch-to-haravan-service";
import RetouchUploaderService from "services/sync/nocodb-to-haravan/design-images/retouch-uploader-service";

export default class DesignImagesController {
  static async uploadRetouch(ctx) {
    const payload = await ctx.req.json();

    if (!payload?.type || !payload?.data) {
      return ctx.json({ message: "Invalid payload" }, 200);
    }

    const service = new RetouchUploaderService(ctx.env);
    const result = await service.handle(payload);

    // Nothing landed in `retouch`: answer 4xx so the operator sees it in
    // NocoDB rather than being told the upload worked.
    if (result?.success === false) {
      return ctx.json({ error: result.reason }, 422);
    }

    return ctx.json({ message: "Retouch images uploaded to NocoDB" });
  }

  static async syncToHaravan(ctx) {
    const payload = await ctx.req.json();

    if (!payload?.type || !payload?.data) {
      return ctx.json({ message: "Invalid payload" }, 200);
    }

    const service = new RetouchToHaravanService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Retouch images synced to Haravan" });
  }
}
