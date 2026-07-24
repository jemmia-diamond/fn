import { v4 as uuidv4 } from "uuid";
import * as Sentry from "@sentry/cloudflare";
import { z } from "zod";
import HaravanAPI from "services/clients/haravan-client";
import Database from "services/database";
import { ERPR2StorageService } from "services/r2-object/erp/erp-r2-storage-service";
import { imageNameNormalizer, R2_TMP_PREFIX } from "services/workplace/design-images/utils.js";

const RetouchItemSchema = z.object({
  signedUrl: z.string(),
  title: z.string()
});

const RetouchToHaravanPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    rows: z.array(z.object({
      designs: z.object({ id: z.number() }),
      design_code: z.string(),
      material_color: z.string(),
      retouch: z.array(RetouchItemSchema).min(1)
    })).min(1)
  })
});

export default class RetouchToHaravanService {
  private env: any;
  private db: ReturnType<typeof Database.instance>;
  private haravanClient: HaravanAPI;
  private r2: ERPR2StorageService;

  constructor(env: any) {
    this.env = env;
    this.db = Database.instance(env);
    this.haravanClient = new HaravanAPI(env.HARAVAN_TOKEN);
    this.r2 = new ERPR2StorageService(env);
  }

  async sync(payload: unknown) {
    const validated = RetouchToHaravanPayloadSchema.parse(payload);
    const row = validated.data.rows[0];

    const { imageNameNorm, colorNorm } = imageNameNormalizer(row.design_code, row.material_color);

    const product = await this.getProductByDesignId(row.designs.id);
    if (!product) {
      throw new Error("No product found for design");
    }

    const haravanProductId = Number(product.haravan_product_id);

    await this.clearExistingColorImages(haravanProductId, colorNorm);
    await this.uploadRetouchImages(haravanProductId, row.retouch, imageNameNorm);
  }

  private async clearExistingColorImages(haravanProductId: number, colorNorm: string) {
    const hrvImagesResult = await this.haravanClient.productImage.getImages(haravanProductId);
    const hrvImages = (hrvImagesResult.images || []).filter((i: any) => i.src?.includes(colorNorm));

    for (const image of hrvImages) {
      await this.haravanClient.productImage.deleteImage(haravanProductId, image.id);
    }

    await this.db.images.deleteMany({
      where: { product_id: haravanProductId, src: { contains: colorNorm } }
    });
  }

  private async uploadRetouchImages(
    haravanProductId: number,
    retouchItems: z.infer<typeof RetouchItemSchema>[],
    imageNameNorm: string
  ) {
    for (let i = 0; i < retouchItems.length; i++) {
      const item = retouchItems[i];
      const ext = item.title?.split(".").pop() || "png";
      const filename = `${imageNameNorm}${String(i + 1).padStart(2, "0")}.${ext}`;
      let r2Key: string | null = null;

      try {
        r2Key = `${R2_TMP_PREFIX}/${uuidv4()}-${filename}`;

        const downloadResponse = await fetch(item.signedUrl);
        if (!downloadResponse.ok) {
          Sentry.captureMessage(
            `RetouchToHaravan: Failed to download ${item.signedUrl} status ${downloadResponse.status}`
          );
          continue;
        }

        await this.r2._putObject(r2Key, downloadResponse.body);

        const buffer = await this.r2._getObject(r2Key);
        if (!buffer) {
          continue;
        }

        const base64 = Buffer.from(buffer).toString("base64");

        await this.haravanClient.productImage.createImage(haravanProductId, {
          attachment: base64,
          filename: filename
        });
      } catch (err) {
        Sentry.captureException(err, { extra: { imageIndex: i, filename } });
      } finally {
        if (r2Key) {
          await this.r2.deleteObject(r2Key);
        }
      }
    }
  }

  private async getProductByDesignId(designId: number) {
    const rows: any[] = await this.db.$queryRaw`
      SELECT haravan_product_id
      FROM workplace.products
      WHERE design_id = ${designId}
    `;
    return rows.length > 0 ? rows[0] : null;
  }
}
