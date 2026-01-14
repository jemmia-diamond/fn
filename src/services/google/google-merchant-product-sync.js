import ProductService from "services/ecommerce/product/product.js";
import GoogleMerchantService from "services/google/google-merchant-service.js";
import * as Sentry from "@sentry/cloudflare";

const LIMIT = 50;

export default class GoogleMerchantProductSyncService {
  constructor(env) {
    this.env = env;
    this.productService = new ProductService(env);
    this.merchantService = new GoogleMerchantService(env);
  }

  async sync() {
    let syncedCount = 0;
    let page = 1;
    let hasMore = true;
    let allMerchantProducts = [];

    try {
      while (hasMore) {
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

        for (const product of products) {
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              const merchantProduct = this._mapToMerchantProduct(product, variant);
              if (merchantProduct) {
                allMerchantProducts.push(merchantProduct);
                syncedCount++;
                break;
              }
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

      if (allMerchantProducts.length > 0) {
        await this.merchantService.insertProducts(allMerchantProducts);
      }

      return { success: true, syncedCount };

    } catch (error) {
      Sentry.captureException(error);
      return { success: false, syncedCount, errors: [error] };
    }
  }

  _mapToMerchantProduct(product, variant) {
    try {
      let imageLink = product.images && product.images.length > 0 ? product.images[0] : "";

      const availability = variant.qty_available > 0 ? "in_stock" : "out_of_stock";

      let priceValue = parseInt(variant.price || 0);

      if (product.product_type && (product.product_type.toLowerCase().includes("bông tai"))) {
        priceValue *= 2;
      }

      const suffix = `${product.design_code ? ` - ${product.design_code}` : ""}`;
      let titlePrefix = product.title;

      const maxPrefixLength = 150 - suffix.length;
      if (titlePrefix.length > maxPrefixLength) {
        titlePrefix = titlePrefix.substring(0, maxPrefixLength - 3) + "...";
      }

      const title = `${titlePrefix}${suffix}`;

      let description = product.description || product.title || "";
      description = description.replace(/<[^>]*>?/gm, "");
      if (description.length > 200) {
        description = description.substring(0, 197) + "...";
      }

      const link = `https://jemmia.vn/products/${product.handle}`;

      const offerId = variant.sku;
      if (!offerId) {
        return null;
      }

      const mpn = product.id ? product.id.toString() : "";
      const itemGroupId = product.code || product.handle || `${product.id}`;

      const allFinenesses = [...new Set(product.variants.map(v => v.fineness).filter(Boolean))].join(", ");
      const allMaterials = [...new Set(product.variants.map(v => v.material_color).filter(Boolean))].join(", ");

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
        brand: "Jemmia Diamond",
        identifierExists: mpn ? "yes" : "no",
        mpn: mpn || undefined,
        itemGroupId: itemGroupId,
        color: allMaterials,
        material: allFinenesses,
        adult: "no"
      };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }
}
