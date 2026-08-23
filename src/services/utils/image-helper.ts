import { Jimp } from "jimp";

export default class ImageHelper {
  static async blurImage(
    buffer: Buffer,
    options?: { blurSize?: number }
  ): Promise<Buffer> {
    const image = await Jimp.read(buffer);

    if (image.width > 720 || image.height > 720) {
      if (image.width > image.height) {
        image.resize({ w: 720 });
      } else {
        image.resize({ h: 720 });
      }
    }

    image.blur(options?.blurSize ?? 20);

    return await image.getBuffer("image/jpeg");
  }
}
