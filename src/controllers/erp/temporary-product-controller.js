import * as Sentry from "@sentry/cloudflare";
import TemporaryProductService from "services/workplace/temporary-product-service";
import RecordService from "services/larksuite/docs/base/record/record";
import { TABLES } from "services/larksuite/docs/constant";

// Lark field on the TEMP_PRODUCT_QUOTE ticket table where creation failures are logged.
const CREATE_ERROR_FIELD = "Lỗi tạo SP";

export default class TemporaryProductController {
  static async create(ctx) {
    const event = await ctx.req.json();
    const tempProductService = new TemporaryProductService(ctx.env);
    try {
      const result = await tempProductService.processTemporaryProduct(event);
      return ctx.json({ data: result }, 200);
    } catch (error) {
      // Log the failure reason back onto the ticket row so a silent fail (empty
      // SKU) is explained. Best-effort: never let this mask the original error.
      if (event?.record_id) {
        try {
          await RecordService.updateLarksuiteRecord({
            env: ctx.env,
            appToken: TABLES.TEMP_PRODUCT_QUOTE.app_token,
            tableId: TABLES.TEMP_PRODUCT_QUOTE.table_id,
            recordId: event.record_id,
            fields: {
              [CREATE_ERROR_FIELD]: `${error.message} @ ${new Date().toISOString()}`
            }
          });
        } catch (logError) {
          Sentry.captureException(logError);
        }
      }
      throw error;
    }
  }
}
