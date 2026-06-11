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

  static async show(c: any) {
    const tokenIdParam = c.req.param("tokenId");
    if (!tokenIdParam || !/^\d+$/.test(tokenIdParam)) {
      return c.json({ error: "Invalid tokenId path parameter" }, 400);
    }
    const tokenId = BigInt(tokenIdParam);

    const service = new DiamondCertificateService(c.env);
    try {
      const detail = await service.getCertificateDetail(tokenId);
      return c.json({ data: detail });
    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? String(err);
      if (message.includes("TokenDoesNotExist")) {
        return c.json({ error: "Token does not exist", tokenId: tokenIdParam }, 404);
      }
      throw err;
    }
  }
}
