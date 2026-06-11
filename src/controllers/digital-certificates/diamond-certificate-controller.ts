import { z } from "zod";
import DiamondCertificateService from "services/digital-certificates/diamond-certificate-service";
import { validateZodOrError } from "services/utils/zod-validator";

const DiamondInfoSchema = z.object({
  reportNo: z.string().min(1),
  shape: z.string().min(1),
  caratWeight: z.string().min(1),
  colorGrade: z.string().min(1),
  clarityGrade: z.string().min(1),
  cutGrade: z.string().min(1),
  measurements: z.string().optional().default(""),
  polish: z.string().optional().default(""),
  symmetry: z.string().optional().default(""),
  fluorescence: z.string().optional().default("")
});

const AttachmentInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().url(),
  description: z.string().optional().default("")
});

const CreateCertificateSchema = z.object({
  productName: z.string().min(1),
  designStory: z.string().optional().default(""),
  traceId: z.string().optional().default(""),
  diamond: DiamondInfoSchema,
  photos: z.array(z.string().url()).optional().default([]),
  videos: z.array(z.string().url()).optional().default([]),
  attachments: z.array(AttachmentInputSchema).optional().default([])
});

export default class DiamondCertificateController {
  static async create(c: any) {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const validated = validateZodOrError(c, CreateCertificateSchema, body);
    if (validated.ok === false) {
      return validated.response;
    }

    const service = new DiamondCertificateService(c.env);
    const certificate = await service.createCertificate(validated.data);
    return c.json({ data: certificate }, 201);
  }
}
