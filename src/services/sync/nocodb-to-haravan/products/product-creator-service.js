import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class ProductCreatorService {
  constructor(env) {
    this.env = env;
  }

  async getDesignInfo(designId) {
    if (!designId) return null;
    const nocoClient = new NocoDBClient(this.env);
    const design = await nocoClient.readRecord(NOCODB_TABLES.SUPPLY.DESIGNS, designId);
    return design || null;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.SUPPLY.JEWELRIES) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    if (!data.auto_create_haravan || data.haravan_product_id) {
      return { skipped: true };
    }

    const {
      id,
      haravan_product_type,
      vendor,
      promotions,
      product_title,
      designs: designsField
    } = data;

    const designId = data.design_id || designsField?.id || designsField || 0;

    const designInfo = await this.getDesignInfo(designId);
    if (!designInfo) {
      throw new Error(`Design info not found for design ID: ${designId}`);
    }

    const templateSuffix = templateSuffixMapping(haravan_product_type);

    const productPayload = {
      title: product_title,
      vendor,
      product_type: haravan_product_type,
      published: false,
      published_scope: "pos",
      template_suffix: templateSuffix,
      tags: promotions || undefined
    };

    const haravanApi = new HaravanAPI(this.env.HARAVAN_NOCODB_TOKEN);
    const created = await haravanApi.product.createProduct(productPayload);
    const productId = created?.product?.id;

    if (!productId) {
      throw new Error("Failed to create product on Haravan");
    }

    const nocoClient = new NocoDBClient(this.env);
    await nocoClient.updateRecords(tableId, {
      id,
      haravan_product_id: String(productId),
      note: "Đã tạo thành công trên haravan"
    });

    return { productId };
  }
}

function templateSuffixMapping(productType) {
  const type = (productType || "").toLowerCase();
  if (type.includes("nhẫn cưới")) {
    return "product.ring.combo";
  }
  if (type.includes("nhẫn nam") || type.includes("nhẫn nữ")) {
    return "product.ring";
  }
  if (type.includes("bông tai")) {
    return "product.earring";
  }
  return "product";
}

