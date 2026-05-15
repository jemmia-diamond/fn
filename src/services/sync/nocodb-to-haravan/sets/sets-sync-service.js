import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";

export default class SetsSyncService {
  constructor(env) {
    this.env = env;
  }

  async sync(payload) {
    const hrvToken = await this.env.HARAVAN_TOKEN_SECRET?.get() || this.env.HARAVAN_API_TOKEN;
    const haravanApi = new HaravanAPI(hrvToken);
    const nocoClient = new NocoDBClient(this.env);

    const rows = payload.data.rows || [];
    const tableId = payload.data.table_id || "sets";

    for (const row of rows) {
      const variantTitle = this.formatVariantTitle(row.design_codes);

      if (payload.type === "records.after.insert") {
        await this.handleInsert(row, variantTitle, haravanApi, nocoClient, tableId);
      } else if (payload.type === "records.after.update") {
        await this.handleUpdate(row, variantTitle, haravanApi);
      } else if (payload.type === "records.after.delete") {
        await this.handleDelete(row, haravanApi);
      }
    }
  }

  formatVariantTitle(designCodes) {
    if (!designCodes) return "Default Title";
    if (Array.isArray(designCodes)) {
      return designCodes.join("/");
    }
    return String(designCodes).split(",").map(s => s.trim()).join("/");
  }

  async handleInsert(row, variantTitle, haravanApi, nocoClient, tableId) {
    const productData = {
      title: row.title || "Untitled",
      product_type: "Bộ Trang Sức Kim Cương",
      variants: [
        {
          option1: variantTitle
        }
      ]
    };

    const created = await haravanApi.product.createProduct(productData);

    if (created && created.product) {
      await nocoClient.updateRecords(tableId, {
        id: row.id,
        haravan_product_id: created.product.id,
        haravan_variant_id: created.product.variants[0].id
      });
    }
  }

  async handleUpdate(row, variantTitle, haravanApi) {
    if (!row.haravan_product_id) return;

    const updateData = {
      id: row.haravan_product_id,
      title: row.title || "Untitled"
    };

    if (row.haravan_variant_id) {
      updateData.variants = [
        {
          id: row.haravan_variant_id,
          option1: variantTitle
        }
      ];
    }

    await haravanApi.product.updateProduct(row.haravan_product_id, updateData);
  }

  async handleDelete(row, haravanApi) {
    if (!row.haravan_product_id) return;

    await haravanApi.product.deleteProduct(row.haravan_product_id);
  }
}
