import ImageTranslationService from "services/media/image-translation-service";

export default class TranslateImageController {
  static async create(c) {
    const body = await c.req.parseBody();
    const image = body.image;

    if (!image || !(image instanceof File)) {
      return c.json({ error: "Missing or invalid image file" }, 400);
    }

    const service = new ImageTranslationService();
    const { translatedImageBuffer, outputFilename } = await service.translateImage(image, c.env);

    return new Response(translatedImageBuffer, {
      headers: {
        "Content-Type": service.responseContentType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`
      }
    });
  }
}
