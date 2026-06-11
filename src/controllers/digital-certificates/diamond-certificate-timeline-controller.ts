import { z } from "zod";
import DiamondCertificateService from "services/digital-certificates/diamond-certificate-service";
import { validateZodOrError } from "services/utils/zod-validator";

const TimelineAttachmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().url(),
  description: z.string().optional().default("")
});

const AddTimelineLogSchema = z.object({
  description: z.string().min(1),
  data: z.string().optional().default(""),
  attachments: z.array(TimelineAttachmentSchema).optional().default([])
});

export default class DiamondCertificateTimelineController {
  static async create(c: any) {
    const tokenIdParam = c.req.param("tokenId");
    if (!tokenIdParam || !/^\d+$/.test(tokenIdParam)) {
      return c.json({ error: "Invalid tokenId path parameter" }, 400);
    }
    const tokenId = BigInt(tokenIdParam);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const validated = validateZodOrError(c, AddTimelineLogSchema, body);
    if (validated.ok === false) {
      return validated.response;
    }

    const service = new DiamondCertificateService(c.env);
    const result = await service.addTimelineLog(tokenId, validated.data);
    return c.json({ data: result }, 201);
  }
}
