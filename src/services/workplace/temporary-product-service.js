import Database from "services/database";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

function tempProductMapper(data) {
  return {
    customer_name: data.customer_name || null,
    customer_phone: data.customer_phone || null,
    design_code: data.design_code || null,
    category: data.category || null,
    applique_material: data.applique_material || null,
    fineness: data.material || null,
    material_color: data.material_color || null,
    size_type: data.size_type || null,
    ring_size: data.size ? parseInt(data.size.replace(/\./g, ""), 10) : null,
    use_case: data.use_case || null,
    lark_base_record_id: data.record_id || null,
    ticket_type: data.ticket_type || null,
    product_group: data.product_group || null,
    gia_report_no: data.gia_report_no || null,
    ref_design_code: data.ref_design_code || null,
    request_code: data.request_code || null,
    is_create_product: data.is_create_product || null,
    price: data.price ? parseInt(data.price, 10) : null
  };
}

export default class TemporaryProductService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.nocodb = new NocoDBClient(env);
  }

  async getHaravanTempProduct() {
    const products = await this.db.haravan_products.findMany({
      where: { title: "Sản Phẩm Tạm" },
      select: { id: true }
    });
    const productIds = products
      .filter(p => p.id !== null && p.id !== undefined)
      .map(p => BigInt(p.id));
    if (productIds.length === 0) return [];

    const grouped = await this.db.haravan_variants.groupBy({
      by: ["product_id"],
      where: { product_id: { in: productIds } },
      _count: { id: true },
      having: { id: { _count: { lt: 470 } } },
      take: 1
    });
    return grouped.map(g => ({ product_id: Number(g.product_id), sum: g._count.id }));
  }

  async insertVariantSerial() {
    const created = await this.nocodb.createRecords(NOCODB_TABLES.SUPPLY.SERIALS, { order_on: null });
    const id = Array.isArray(created) ? created[0]?.id : created?.id;
    return await this.nocodb.readRecord(NOCODB_TABLES.SUPPLY.SERIALS, id);
  }

  async addTemporaryProduct(data) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
    );
    const created = await this.nocodb.createRecords(NOCODB_TABLES.SUPPLY.TEMPORARY_PRODUCTS, cleanData);
    const id = Array.isArray(created) ? created[0]?.id : created?.id;
    return { id };
  }

  async getTemporaryProductByLarkRecordId(recordId) {
    const result = await this.nocodb.listRecords(NOCODB_TABLES.SUPPLY.TEMPORARY_PRODUCTS, {
      where: `(lark_base_record_id,eq,${recordId})`,
      limit: 1
    });
    return result?.list?.[0] || null;
  }

  async updateTemporaryProductById(id, data) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
    );
    if (Object.keys(cleanData).length === 0) return null;
    const result = await this.nocodb.updateRecords(NOCODB_TABLES.SUPPLY.TEMPORARY_PRODUCTS, { id, ...cleanData });
    return result;
  }

  async upsertTemporaryProduct(data) {
    let existing;
    if (data.lark_base_record_id) {
      existing = await this.getTemporaryProductByLarkRecordId(data.lark_base_record_id);
    }

    if (existing) {
      return await this.updateTemporaryProductById(existing.id, data);
    } else {
      return await this.addTemporaryProduct(data);
    }
  }

  async _createHaravanProduct(haravanClient) {
    const result = await haravanClient.products.createProduct({
      title: "Sản Phẩm Tạm",
      vendor: "Jemmia",
      product_type: "virtual",
      options: [
        { name: "Tiêu đề" }
      ]
    });
    const productId = result?.data?.product?.id;
    if (!productId) {
      throw new Error("Could not create Haravan product");
    }
    return productId;
  }

  _isVariantLimitError(result) {
    if (result.status !== 422) return false;
    const body = JSON.stringify(result.error || "").toLowerCase();
    return body.includes("variant");
  }

  async _createVariantWithFallback(haravanClient, productId, variantData) {
    let result = await haravanClient.productVariants.createVariant(productId, variantData);

    if (!result.success) {
      if (!this._isVariantLimitError(result)) {
        throw new Error(`Could not create Haravan variant: ${result.message}`);
      }
      productId = await this._createHaravanProduct(haravanClient);
      result = await haravanClient.productVariants.createVariant(productId, variantData);
      if (!result.success) {
        throw new Error(`Could not create Haravan variant: ${result.message}`);
      }
    }

    return { result, productId };
  }

  async processTemporaryProduct(event) {
    const data = event;
    const tempProductData = tempProductMapper(data);

    const haravanClient = new HaravanAPIClient(this.env);

    const haravanTempProducts = await this.getHaravanTempProduct();
    let haravanProductId;

    if (!haravanTempProducts || haravanTempProducts.length === 0) {
      haravanProductId = await this._createHaravanProduct(haravanClient);
    } else {
      haravanProductId = haravanTempProducts[0].product_id;
    }

    if (tempProductData.product_group?.toLowerCase() === "kim cương") {
      let giaReportNo = tempProductData.gia_report_no || "";
      if (!giaReportNo.toUpperCase().startsWith("GIA")) {
        giaReportNo = "GIA" + giaReportNo;
      }
      giaReportNo = giaReportNo.trim();

      const variantData = {
        option1: [giaReportNo, tempProductData.customer_name, tempProductData.customer_phone].join(" - "),
        sku: giaReportNo,
        price: tempProductData.price,
        inventory_management: "haravan",
        inventory_policy: "continue"
      };

      const { result, productId } = await this._createVariantWithFallback(haravanClient, haravanProductId, variantData);

      tempProductData.haravan_variant_id = result?.data?.variant?.id;
      tempProductData.haravan_product_id = productId;

      await this.upsertTemporaryProduct(tempProductData);

      return {
        sku: result?.data?.variant?.sku,
        serial_number: ""
      };
    }

    const designCode = tempProductData.design_code;
    if (!designCode) {
      throw new Error("Missing design_code");
    }

    let temporaryProduct;
    try {
      temporaryProduct = await this.addTemporaryProduct(tempProductData);
    } catch {
      temporaryProduct = await this.getTemporaryProductByLarkRecordId(tempProductData.lark_base_record_id);
    }

    if (!temporaryProduct) {
      throw new Error("Could not fetch or create Temporary Product");
    }

    const tempProductId = temporaryProduct.id;
    const sku = "SPT-" + tempProductId;

    const variantData = {
      option1: [
        designCode,
        data.product_type || "",
        tempProductData.fineness,
        tempProductData.customer_name,
        tempProductData.customer_phone,
        sku
      ].join(" - "),
      sku: sku,
      price: tempProductData.price,
      inventory_management: "haravan",
      inventory_policy: "continue"
    };

    const { result, productId } = await this._createVariantWithFallback(haravanClient, haravanProductId, variantData);
    const variantSerial = await this.insertVariantSerial();

    await this.updateTemporaryProductById(tempProductId, {
      haravan_variant_id: result?.data?.variant?.id,
      haravan_product_id: productId,
      variant_serial_id: variantSerial.id
    });

    return {
      sku: result?.data?.variant?.sku,
      serial_number: variantSerial.serial_number
    };
  }
}
