import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import Database from "services/database";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

/**
 * Remove Vietnamese diacritical marks from a string.
 */
function removeVietnameseChars(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
}

/**
 * Normalize image name from design code and material color.
 * Returns [imageNameNorm, colorNorm]
 */
function imageNameNormalizer(designCode, color) {
  const normColor = removeVietnameseChars(color)
    .replace(/ - /g, "-")
    .replace(/ /g, "-")
    .toLowerCase();
  return [`${designCode}--${normColor}--`.toLowerCase(), `${normColor}--`.toLowerCase()];
}

export default class RetouchToHaravanService {
  constructor(env) {
    this.env = env;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.MARKETING.DESIGN_IMAGES) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    const designId = data.designs?.id || data.design_id;
    const designCode = data.design_code;
    const materialColor = data.material_color;
    const retouchImages = data.retouch;

    if (!designId) throw new Error("design_id is missing");
    if (!designCode) throw new Error("design_code is missing");
    if (!materialColor) throw new Error("material_color is missing");
    if (!retouchImages || !Array.isArray(retouchImages) || retouchImages.length === 0) {
      throw new Error("No retouch images found");
    }

    const [imageNameNorm, colorNorm] = imageNameNormalizer(designCode, materialColor);

    // Look up the Haravan product ID from NocoDB products table RESTfully
    const nocoClient = new NocoDBClient(this.env);
    const response = await nocoClient.listRecords(NOCODB_TABLES.MARKETING.JEWELRIES, {
      where: `(design_id,eq,${Number(designId)})`,
      limit: 1
    });

    const products = response.list || [];

    if (products.length === 0) {
      throw new Error(`No product found for design_id: ${designId}`);
    }

    const haravanProductId = products[0].haravan_product_id;
    if (!haravanProductId) {
      throw new Error(`Product has no haravan_product_id for design_id: ${designId}`);
    }

    const haravanApi = new HaravanAPI(this.env.HARAVAN_NOCODB_TOKEN);

    // Get existing Haravan images and delete ones matching this color
    const existingImages = await haravanApi.productImage.getImages(haravanProductId);
    const imagesToDelete = (existingImages?.images || []).filter(
      (img) => img.src && img.src.includes(colorNorm)
    );

    for (const image of imagesToDelete) {
      await haravanApi.productImage.deleteImage(haravanProductId, image.id);
    }

    // Clean up local database records for deleted images using Prisma ORM instead of raw SQL
    if (imagesToDelete.length > 0) {
      const db = Database.instance(this.env);
      await db.images.deleteMany({
        where: {
          product_id: Number(haravanProductId),
          src: {
            contains: colorNorm
          }
        }
      });
    }

    // Upload retouch images to Haravan using signedUrl as src
    for (let i = 0; i < retouchImages.length; i++) {
      const r = retouchImages[i];
      const ext = r.title?.split(".")?.pop() || "png";
      const fileName = `${imageNameNorm}${String(i + 1).padStart(2, "0")}.${ext}`;

      await haravanApi.productImage.createImage(haravanProductId, {
        src: r.signedUrl,
        filename: fileName
      });
    }

    return { success: true, haravanProductId, imagesUploaded: retouchImages.length };
  }
}
