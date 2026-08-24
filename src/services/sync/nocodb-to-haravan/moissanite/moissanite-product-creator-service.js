import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const PRODUCT_TYPE_CONFIG = {
  "Đá Moissanite": {
    haravan_product_type: "Đá Moissanite",
    barcode_prefix: "MS"
  },
  "Kim cương CVD": {
    haravan_product_type: "Kim cương CVD",
    barcode_prefix: "LG"
  }
};

function resolveProductType(row) {
  const productGroup = row.product_group;
  if (typeof productGroup === "string") {
    if (productGroup.includes("Moissanite")) return "Đá Moissanite";
    if (productGroup.includes("CVD")) return "Kim cương CVD";
  }
  return "Đá Moissanite";
}

function parsePrice(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function formatNumber(value, length) {
  return String(value).padStart(length, "0");
}

async function generateBarcode(nocoClient, prefix, length = 10) {
  const records = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.MOISSANITE, {
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

export default class MoissaniteProductCreatorService {
  constructor(env) {
    this.env = env;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.SUPPLY.MOISSANITE) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    if (data.haravan_product_id) {
      return { skipped: true, reason: "haravan_product_id already exists" };
    }

    const { id, title, price } = data;
    const sku = data["sku(formula)"] || data.sku;

    if (!title) {
      throw new Error("Title is empty");
    }

    if (!sku) {
      throw new Error("SKU is empty");
    }

    const productType = resolveProductType(data);
    const config = PRODUCT_TYPE_CONFIG[productType];
    if (!config) {
      throw new Error(`Unsupported product type: ${productType}`);
    }

    const nocoClient = new NocoDBClient(this.env);
    const barcode = await generateBarcode(nocoClient, config.barcode_prefix);

    const haravanApi = new HaravanAPI(this.env.HARAVAN_NOCODB_TOKEN);
    const created = await haravanApi.product.createProduct({
      title,
      product_type: config.haravan_product_type,
      vendor: "Jemmia",
      variants: [
        {
          sku,
          barcode,
          price: parsePrice(price),
          inventory_policy: "deny",
          inventory_management: "haravan",
          option1: sku
        }
      ]
    });

    const productId = created?.product?.id;
    const variantId = created?.product?.variants?.[0]?.id;

    if (!productId || !variantId) {
      throw new Error("Failed to create product on Haravan");
    }

    await nocoClient.updateRecords(tableId, {
      id,
      haravan_product_id: Number(productId),
      haravan_variant_id: Number(variantId),
      barcode
    });

    return { productId, variantId, barcode };
  }
}
