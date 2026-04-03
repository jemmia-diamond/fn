import ImageTranslationService from "services/media/image-translation-service";
import { v4 as uuidv4 } from "uuid";

export default class TranslateImageController {
  static async create(c) {
    try {
      const body = await c.req.parseBody();
      const image = body.image;

      if (!image || !(image instanceof File)) {
        return c.json({ error: "Missing or invalid image file" }, 400);
      }

      const imageArrayBuffer = await image.arrayBuffer();
      const imageBuffer = new Uint8Array(imageArrayBuffer);

      const service = new ImageTranslationService();
      const translatedImageBuffer = await service.translateImage(imageBuffer, c.env);

      const uniqueId = uuidv4().split("-")[0]; // Use a short version of UUID
      const outputFilename = `en_${image.name.split(".")[0]}_${uniqueId}.jpg`;

      return new Response(translatedImageBuffer, {
        headers: {
          "Content-Type": service.responseContentType,
          "Content-Disposition": `attachment; filename="${outputFilename}"`
        }
      });
    } catch (error) {
      return c.json(
        {
          error: "Failed to translate image",
          message: error.message
        },
        500
      );
    }
  }
}
