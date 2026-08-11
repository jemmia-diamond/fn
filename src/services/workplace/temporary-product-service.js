import Database from "services/database";
import HaravanAPIClient from "services/haravan/api-client/api-client";

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
  }

  async getHaravanTempProduct() {
    const result = await this.db.$queryRaw`
      SELECT
        p.id AS product_id,
        count(v.id) AS sum
      FROM haravan.products p
        INNER JOIN haravan.variants v ON p.id = v.product_id
      WHERE p.title = 'Sản Phẩm Tạm'
      GROUP BY 1
      HAVING count(v.id) < 470
      LIMIT 1
    `;
    return result;
  }

  async insertVariantSerial() {
    const result = await this.db.$queryRaw`
      INSERT INTO workplace.variant_serials (order_on)
      VALUES (NULL)
      RETURNING *;
    `;
    return result[0];
  }

  async addTemporaryProduct(data) {
    const keys = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null);
    const values = keys.map(k => data[k]);
    const columns = keys.map(k => `"${k}"`).join(", ");
    const bindParams = values.map((_, i) => `$${i + 1}`).join(", ");

    // eslint-disable-next-line
    const result = await this.db.$queryRawUnsafe(`
      INSERT INTO workplace.temporary_products (${columns})
      VALUES (${bindParams})
      RETURNING *;
    `, ...values);
    return result[0];
  }

  async getTemporaryProductByLarkRecordId(recordId) {
    const result = await this.db.$queryRaw`
      SELECT * FROM workplace.temporary_products
      WHERE lark_base_record_id = ${recordId}
      LIMIT 1
    `;
    return result[0];
  }

  async updateTemporaryProductById(id, data) {
    const keys = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null);

    if (keys.length === 0) return null;

    const setClause = keys.map((k, i) => `"${k}" = $${i + 2}`).join(", ");
    const values = keys.map(k => data[k]);

    // eslint-disable-next-line
    const result = await this.db.$queryRawUnsafe(`
      UPDATE workplace.temporary_products
      SET ${setClause}
      WHERE id = $1
      RETURNING *;
    `, id, ...values);

    return result[0];
  }

  async upsertTemporaryProduct(data) {
    let existing;
    if (data.sku) {
      const res = await this.db.$queryRaw`SELECT id FROM workplace.temporary_products WHERE sku = ${data.sku} LIMIT 1`;
      existing = res[0];
    } else if (data.lark_base_record_id) {
      const res = await this.db.$queryRaw`SELECT id FROM workplace.temporary_products WHERE lark_base_record_id = ${data.lark_base_record_id} LIMIT 1`;
      existing = res[0];
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
      // 422 with variant error — product capacity reached, create new product and retry
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

      const option1Parts = [
        giaReportNo,
        tempProductData.customer_name,
        tempProductData.customer_phone
      ].filter(Boolean);

      const variantData = {
        option1: option1Parts.join(" - "),
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
