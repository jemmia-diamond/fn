import PinataUploadService from "services/pinata/upload-service";

export default class PinataFileUploadController {
  static async create(c: any) {
    const body = await c.req.parseBody();
    const file = body.file;
    const name = typeof body.name === "string" ? body.name : undefined;
    const groupId = typeof body.groupId === "string" ? body.groupId : undefined;

    if (!file || !(file instanceof File)) {
      return c.json({ error: "Missing or invalid 'file' field" }, 400);
    }

    let keyvalues: Record<string, string> | undefined;
    if (typeof body.keyvalues === "string" && body.keyvalues.length > 0) {
      try {
        const parsed = JSON.parse(body.keyvalues);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          keyvalues = {};
          for (const [k, v] of Object.entries(parsed)) {
            keyvalues[String(k)] = String(v);
          }
        }
      } catch {
        return c.json({ error: "Invalid 'keyvalues' JSON" }, 400);
      }
    }

    const service = new PinataUploadService(c.env);
    const result = await service.uploadFile(file, {
      name: name ?? file.name,
      keyvalues,
      groupId
    });

    return c.json(result);
  }
}
