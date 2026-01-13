import ProductService from "services/ecommerce/product/product.js";
import GoogleMerchantService from "services/google/google-merchant-service.js";

const LIMIT = 50;

export default class GoogleMerchantProductSyncService {
  constructor(env) {
    this.env = env;
    this.productService = new ProductService(env);
    this.merchantService = new GoogleMerchantService(env);
  }

  async sync() {
    console.warn("Starting Product Sync...");
    let syncedCount = 0;
    let page = 1;
    let hasMore = true;
    let allMerchantProducts = [];
    const errors = [];

    try {
      while (hasMore) {
        console.warn(`Fetching page ${page}...`);

        const jsonParams = {
          pagination: {
            from: page,
            limit: LIMIT
          },
          sort: { by: "price", order: "desc" },
          extraFields: ["sku"]
        };

        const result = await this.productService.getJewelry(jsonParams);
        const products = result.data;
        const count = result.metadata.total;

        if (!products || products.length === 0) {
          hasMore = false;
          break;
        }

        console.warn(`fetched ${products.length} products from DB.`);

        for (const product of products) {
          for (const variant of product.variants) {
            const merchantProduct = this._mapToMerchantProduct(product, variant);
            if (merchantProduct) {
              allMerchantProducts.push(merchantProduct);
              syncedCount++;
            }
          }
        }

        const totalFetched = (page - 1) * LIMIT + products.length;
        if (totalFetched >= count) {
          hasMore = false;
        } else {
          page++;
        }
      }

      console.warn(`Total variants prepared for sync: ${allMerchantProducts.length}`);

      if (allMerchantProducts.length > 0) {
        await this.merchantService.insertProducts(allMerchantProducts);
      } else {
        console.warn("No products to sync.");
      }

      console.warn("Sync completed successfully.");
      return { success: true, syncedCount, errors };

    } catch (error) {
      console.warn("Error during sync:", error);
      return { success: false, syncedCount, errors: [error] };
    }
  }

  _mapToMerchantProduct(product, variant) {
    try {
      let imageLink = product.images && product.images.length > 0 ? product.images[0] : "";

      const availability = variant.qty_available > 0 ? "in_stock" : "out_of_stock";

      const priceValue = parseInt(variant.price || 0);

      // Title: Max 150 chars
      let title = `${product.title} - ${variant.material_color} ${variant.fineness}`;
      if (title.length > 150) {
        title = title.substring(0, 147) + "...";
      }

      // Description: Max 200 chars
      let description = product.description || product.title || "";
      // Strip HTML tags
      description = description.replace(/<[^>]*>?/gm, "");
      if (description.length > 200) {
        description = description.substring(0, 197) + "...";
      }

      const link = `https://jemmia.vn/products/${product.handle}`;

      const offerId = variant.sku;
      if (!offerId) {
        console.warn(`Product ${product.id} Variant ${variant.id} has no SKU. Skipping.`);
        return null;
      }

      const mpn = product.id ? product.id.toString() : "";
      const itemGroupId = product.code || product.handle || `${product.id}`;

      return {
        channel: "ONLINE",
        offerId: offerId.toLowerCase(),
        contentLanguage: "vi",
        targetCountry: "VN",
        feedLabel: "VN",
        title: title,
        description: description,
        link: link,
        imageLink: imageLink,
        price: {
          value: priceValue.toString(),
          currency: "VND"
        },
        availability: availability,
        condition: "new",
        brand: "Jemmia",
        identifierExists: mpn ? "yes" : "no",
        mpn: mpn || undefined,
        itemGroupId: itemGroupId,
        color: variant.material_color,
        material: variant.fineness,
        adult: "no"
      };
    } catch (err) {
      console.warn(`Error mapping product ${product.id} variant ${variant?.id}:`, err);
      return null;
    }
  }
}
