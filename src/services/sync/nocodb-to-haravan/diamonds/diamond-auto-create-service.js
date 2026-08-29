import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";

const SHAPE_IMAGES_BASE_URL =
  "https://cdn.jemmia.vn/nc/uploads/noco/diamond-shapes";

export default class DiamondAutoCreateService {
  constructor(env) {
    this.env = env;
  }

  async create(row, tableId) {
    const haravanApi = new HaravanAPI(this.env.HARAVAN_NOCODB_TOKEN);
    const nocoClient = new NocoDBClient(this.env);

    const {
      id,
      product_name,
      vendor,
      shape,
      promotions,
      original_code,
      price,
      SKU
    } = row;

    const created = await haravanApi.product.createProduct({
      title: product_name,
      vendor,
      product_type: shape,
      published: false,
      tags: promotions || undefined,
      variants: [
        {
          option1: original_code,
          price,
          sku: SKU,
          requires_shipping: true,
          inventory_management: "haravan",
          inventory_quantity: 0,
          old_inventory_quantity: 0,
          qty_commited: 1
        }
      ]
    });

    const productId = created?.product?.id;
    const variantId = created?.product?.variants?.[0]?.id;

    if (!productId || !variantId) return;

    await haravanApi.productImage.createImage(productId, {
      src: `${SHAPE_IMAGES_BASE_URL}/${encodeURIComponent(shape)}.png`,
      variant_ids: variantId ? [variantId] : []
    });

    await nocoClient.updateRecords(tableId, {
      id,
      product_id: productId,
      variant_id: variantId,
      link_haravan: `https://jemmiavn.myharavan.com/admin/products/${productId}`,
      note: "Đã tạo thành công trên haravan"
    });
  }
}
