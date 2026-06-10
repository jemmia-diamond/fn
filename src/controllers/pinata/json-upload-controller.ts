import PinataUploadService from "services/pinata/upload-service";

export default class PinataJsonUploadController {
  static async create(c: any) {
    let payload: any;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return c.json({ error: "Body must be a JSON object" }, 400);
    }

    const body = payload as Record<string, unknown>;
    const data = body.data as Record<string, unknown> | undefined;
    const name = typeof body.name === "string" ? body.name : undefined;
    const groupId = typeof body.groupId === "string" ? body.groupId : undefined;
    const keyvalues = body.keyvalues as Record<string, string> | undefined;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return c.json(
        { error: "Missing or invalid 'data' field (must be a JSON object)" },
        400
      );
    }

    if (keyvalues !== undefined) {
      if (
        !keyvalues ||
        typeof keyvalues !== "object" ||
        Array.isArray(keyvalues)
      ) {
        return c.json(
          { error: "'keyvalues' must be a JSON object of string values" },
          400
        );
      }
    }

    const service = new PinataUploadService(c.env);
    const result = await service.uploadJson(data, { name, keyvalues, groupId });

    return c.json(result);
  }
}
