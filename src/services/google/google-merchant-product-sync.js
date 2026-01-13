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
          is_in_stock: true,
          sort: { by: "price", order: "desc" }
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

      const availability = variant.qty_available > 0 ? "in stock" : "out of stock";

      const priceValue = parseInt(variant.price || 0);
      const amountMicros = (BigInt(priceValue) * BigInt(1000000)).toString();

      const title = `${product.title} - ${variant.material_color} ${variant.fineness}`;
      const link = `https://jemmia.vn/products/${product.handle}?variant=${variant.id}`;

      return {
        channel: "ONLINE",
        offerId: `${variant.id}`,
        contentLanguage: "vi",
        targetCountry: "VN",
        feedLabel: "VN",
        attributes: {
          title: title,
          description: product.title,
          link: link,
          imageLink: imageLink,
          price: {
            amountMicros: amountMicros,
            currency: "VND"
          },
          availability: availability,
          condition: "new",
          brand: "Jemmia",
          color: variant.material_color,
          material: variant.fineness
        }
      };
    } catch (err) {
      console.warn(`Error mapping product ${product.id} variant ${variant?.id}:`, err);
      return null;
    }
  }
}
