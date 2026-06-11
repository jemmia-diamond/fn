import { z } from "zod";
import PinataUploadService from "services/pinata/upload-service";
import { validateZodOrError } from "services/utils/zod-validator";

const JsonUploadSchema = z.object({
  name: z.string().optional(),
  groupId: z.string().optional(),
  keyvalues: z.record(z.string(), z.string()).optional(),
  data: z.record(z.string(), z.unknown())
});

export default class PinataJsonUploadController {
  static async create(c: any) {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const validated = validateZodOrError(c, JsonUploadSchema, body);
    if (validated.ok === false) {
      return validated.response;
    }

    const { data, name, keyvalues, groupId } = validated.data;
    const service = new PinataUploadService(c.env);
    const result = await service.uploadJson(data, { name, keyvalues, groupId });

    return c.json(result);
  }
}
