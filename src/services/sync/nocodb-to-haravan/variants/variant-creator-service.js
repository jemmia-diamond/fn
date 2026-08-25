import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const barcodeConfig = {
  "Bông Tai": "ER",
  "Bông Tai Nguyên Chiếc": "EF",
  "Dây Chuyền Trơn": "BI",
  "Dây Chuyền Charm": "CN",
  "Dây Chuyền Nguyên Chiếc": "CF",
  "Dây Chuyền Liền Mặt": "PN",
  "Vòng Cổ": "NL",
  "Huy Hiệu": "LP",
  "Khuyên Mũi": "NR",
  "Lắc Tay": "BL",
  "Vòng Tay": "BR",
  "Mặt Dây Chuyền": "PD",
  "Nhẫn Cưới": "WR",
  "Nhẫn Nam": "MR",
  "Nhẫn Nam Nguyên Chiếc": "MF",
  "Nhẫn Nữ": "FR",
  "Nhẫn Nữ Nguyên Chiếc": "FF",
  "Bộ Trang Sức Kim Cương": "CL",
  "Móc Khoá": "KC",
  "Nhẫn Unisex": "UR",
  "Nhẫn Unisex Nguyên Chiếc": "UF",
  Charm: "CH"
};

export default class VariantCreatorService {
  constructor(env) {
    this.env = env;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.SUPPLY.VARIANTS) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    if (!data.auto_create_variant || data.haravan_variant_id) {
      return { skipped: true };
    }

    const {
      id: recordId,
      design_code,
      fineness,
      material_color,
      size_type,
      ring_size,
      title,
      price
    } = data;

    const nocoClient = new NocoDBClient(this.env);

    const productId =
      data.products?.id ||
      data.products_id ||
      data.product_id ||
      data.products ||
      0;
    if (!productId) {
      throw new Error("Parent product ID is missing");
    }

    const product = await nocoClient.readRecord(
      NOCODB_TABLES.SUPPLY.JEWELRIES,
      productId
    );
    const haravanProductId = product?.haravan_product_id;
    const productType = product?.haravan_product_type;

    if (!haravanProductId) {
      throw new Error("Haravan product ID not found for parent jewelry");
    }

    let designType = "";
    if (design_code) {
      const designs = await nocoClient.listRecords(
        NOCODB_TABLES.SUPPLY.DESIGNS,
        {
          where: `(design_code,eq,${design_code})`,
          limit: 1
        }
      );
      const designInfo = designs.list?.[0] || null;
      if (designInfo) {
        designType = designInfo.design_type;
      }
    }

    if (!designType && data.design_type_norm) {
      designType = data.design_type_norm;
    }

    if (!designType) {
      throw new Error(`Design type not found for design code: ${design_code}`);
    }

    const { validated, note } = validate(
      designType,
      size_type,
      ring_size,
      fineness,
      material_color
    );
    if (!validated) {
      await nocoClient.updateRecords(tableId, {
        id: recordId,
        note
      });
      return { skipped: true, reason: note };
    }

    const sku = data["sku (formula)"] || data.sku;
    if (!sku || sku.includes("*")) {
      throw new Error(`SKU is empty or invalid: ${sku}`);
    }

    const barcodePrefix = barcodeConfig[productType];
    if (!barcodePrefix) {
      throw new Error(
        `No barcode prefix configured for product type: ${productType}`
      );
    }
    const barcode = await generateBarcode(nocoClient, barcodePrefix);

    let variantTitle = title;
    if (!variantTitle) {
      throw new Error("Title is empty");
    }
    variantTitle = String(variantTitle);
    if (variantTitle.endsWith(".0")) {
      variantTitle = variantTitle.slice(0, -2);
    }

    const variantData = {
      sku,
      barcode,
      option1: variantTitle,
      price: price != null ? Number(price) : 0,
      inventory_policy: "deny",
      inventory_management: "haravan",
      requires_shipping: true
    };

    const haravanApi = new HaravanAPI(this.env.HARAVAN_NOCODB_TOKEN);
    const haravanProduct = await haravanApi.product.getProduct(haravanProductId);
    const haravanVariants = haravanProduct?.product?.variants || [];
    const defaultVariant = haravanVariants.find(
      (v) => v.title === "Default Title"
    );

    let haravanVariantId;
    if (defaultVariant) {
      haravanVariantId = defaultVariant.id;
      await haravanApi.productVariant.updateVariant(
        haravanVariantId,
        variantData
      );
    } else {
      const createdVariant = await haravanApi.productVariant.createVariant(
        haravanProductId,
        variantData
      );
      haravanVariantId = createdVariant?.variant?.id;
    }

    if (!haravanVariantId) {
      throw new Error("Failed to create or update variant on Haravan");
    }

    await nocoClient.updateRecords(tableId, {
      id: recordId,
      barcode,
      haravan_product_id: Number(haravanProductId),
      haravan_variant_id: Number(haravanVariantId),
      sku,
      note: "tạo thành công"
    });

    return { haravanVariantId };
  }
}

function formatNumber(value, length) {
  return String(value).padStart(length, "0");
}

async function generateBarcode(nocoClient, prefix, length = 11) {
  const records = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.VARIANTS, {
    where: `(barcode,like,${prefix}%)`,
    sort: "-barcode",
    limit: 100
  });

  const maxBarcode =
    records.list
      ?.filter((v) => v.barcode && v.barcode.length === length)
      ?.map((v) => v.barcode)?.[0] || null;

  if (!maxBarcode) {
    return `${prefix}${formatNumber(1, length - prefix.length)}`;
  }

  const digits = maxBarcode.slice(-length + prefix.length);
  const number = parseInt(digits, 10) + 1;
  return `${prefix}${formatNumber(number, length - prefix.length)}`;
}

function validate1(designType, sizeType, ringSize) {
  const dt = (designType || "").toLowerCase();
  const st = (sizeType || "").toLowerCase();
  const size = Number(ringSize);

  if (dt.includes("nhẫn")) {
    if (st !== "ni nhẫn") {
      return { validated: false, note: "Loại kích thước không hợp lệ" };
    }
    if (isNaN(size) || size < 4) {
      return { validated: false, note: "Kich thước không hợp lệ" };
    }
  }
  return { validated: true, note: null };
}

function validate2(fineness, materialColor) {
  const f = (fineness || "").toLowerCase();
  const mc = (materialColor || "").toLowerCase();

  if (f === "bạc 925") {
    if (mc !== "bạc") {
      return { validated: false, note: "Màu sắc không hợp lệ" };
    }
  }
  return { validated: true, note: null };
}

function validate(designType, sizeType, ringSize, fineness, materialColor) {
  const res1 = validate1(designType, sizeType, ringSize);
  if (!res1.validated) {
    return res1;
  }
  return validate2(fineness, materialColor);
}
