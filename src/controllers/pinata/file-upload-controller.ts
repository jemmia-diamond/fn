import { z } from "zod";
import PinataUploadService from "services/pinata/upload-service";
import { validateZodOrError } from "services/utils/zod-validator";

const FileUploadSchema = z.object({
  file: z.instanceof(File, {
    message: "Missing or invalid 'file' field"
  }),
  name: z.string().optional(),
  groupId: z.string().optional(),
  keyvalues: z.record(z.string(), z.string()).optional()
});

export default class PinataFileUploadController {
  static async create(c: any) {
    const body = await c.req.parseBody();

    if (typeof body.keyvalues === "string") {
      try {
        body.keyvalues = JSON.parse(body.keyvalues);
      } catch {
        return c.json({ error: "Invalid 'keyvalues' JSON" }, 400);
      }
    }

    const validated = validateZodOrError(c, FileUploadSchema, body);
    if (validated.ok === false) {
      return validated.response;
    }

    const { file, name, keyvalues, groupId } = validated.data;
    const service = new PinataUploadService(c.env);
    const result = await service.uploadFile(file, {
      name: name ?? file.name,
      keyvalues,
      groupId
    });

    return c.json(result);
  }
}
