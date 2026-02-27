import ProductService from "services/ecommerce/product/product.js";
import DiamondService from "services/ecommerce/diamond/diamond.js";
import GoogleMerchantService from "services/google/google-merchant-service.js";
import * as Sentry from "@sentry/cloudflare";

const LIMIT = 50;

export default class GoogleMerchantProductSyncService {
  constructor(env) {
    this.env = env;
    this.productService = new ProductService(env);
    this.diamondService = new DiamondService(env);
    this.merchantService = new GoogleMerchantService(env);
  }

  async sync() {
    let syncedCount = 0;
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore) {
        const jsonParams = {
          pagination: {
            from: (page - 1) * LIMIT + 1,
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

        const batchMerchantProducts = [];
        for (const product of products) {
          if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
              const merchantProduct = this._mapToMerchantProduct(product, variant);
              if (merchantProduct) {
                batchMerchantProducts.push(merchantProduct);
                break;
              }
            }
          }
        }

        if (batchMerchantProducts.length > 0) {
          try {
            await this.merchantService.insertProducts(batchMerchantProducts);
            syncedCount += batchMerchantProducts.length;
          } catch (error) {
            Sentry.captureException(error);
          }
        }

        const totalFetched = (page - 1) * LIMIT + products.length;
        if (totalFetched >= count) {
          hasMore = false;
        } else {
          page++;
        }
      }

      const diamondSyncedCount = await this._syncDiamondProducts();
      syncedCount += diamondSyncedCount;

      return { success: true, syncedCount };

    } catch (error) {
      Sentry.captureException(error);
      return { success: false, syncedCount, errors: [error] };
    }
  }

  _mapToMerchantProduct(product, variant) {
    try {
      let imageLink = product.images && product.images.length > 0 ? product.images[0] : "";

      let availability = "in_stock";
      let availabilityDate = undefined;

      if (variant.qty_available <= 0) {
        availability = "preorder";
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        availabilityDate = date.toISOString();
      }

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
        offerId: offerId.toLowerCase(),
        contentLanguage: "vi",
        feedLabel: "VN",
        attributes: {
          title: title,
          description: description,
          link: link,
          imageLink: imageLink,
          price: {
            amountMicros: (priceValue * 1000000).toString(),
            currencyCode: "VND"
          },
          availability: availability,
          availabilityDate: availabilityDate,
          condition: "new",
          brand: "Jemmia Diamond",
          identifierExists: mpn ? "yes" : "no",
          mpn: mpn || undefined,
          itemGroupId: itemGroupId,
          color: allMaterials,
          material: allFinenesses,
          adult: "no"
        }
      };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }

  _mapDiamondToMerchantProduct(diamond) {
    try {
      let imageLink = diamond.images && diamond.images.length > 0 ? diamond.images[0] : "";

      let availability = "in_stock";

      let priceValue = parseInt(diamond.price || 0);

      const title = diamond.title;

      let description = diamond.title;

      const link = `https://jemmia.vn/products/${diamond.handle}`;

      const offerId = diamond.sku;
      if (!offerId) {
        return null;
      }

      const itemGroupId = diamond.product_id ? diamond.product_id.toString() : `${diamond.variant_id}`;

      return {
        offerId: offerId.toLowerCase(),
        contentLanguage: "vi",
        feedLabel: "VN",
        attributes: {
          title: title,
          description: description,
          link: link,
          imageLink: imageLink,
          price: {
            amountMicros: (priceValue * 1000000).toString(),
            currencyCode: "VND"
          },
          availability: availability,
          condition: "new",
          brand: "Jemmia Diamond",
          identifierExists: "yes",
          mpn: offerId,
          itemGroupId: itemGroupId,
          color: diamond.color,
          material: "Diamond",
          adult: "no"
        }
      };
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }

  /**
   * Syncs diamond products to Google Merchant.
   * Fetches diamonds in pages, maps them to merchant products, and inserts them in batches.
   * @returns {Promise<number>} The number of successfully synced diamond products.
   */
  async _syncDiamondProducts() {
    let page = 1;
    let hasMore = true;
    let syncedCount = 0;

    while (hasMore) {
      const jsonParams = {
        pagination: {
          from: (page - 1) * LIMIT + 1,
          limit: LIMIT
        },
        sort: { by: "price", order: "desc" },
        extraFields: ["sku"]
      };

      const result = await this.diamondService.getDiamonds(jsonParams);
      const diamonds = result.data;
      const count = result.metadata.total;

      if (!diamonds || diamonds.length === 0) {
        hasMore = false;
        break;
      }

      const batchMerchantProducts = [];
      for (const diamond of diamonds) {
        const merchantProduct = this._mapDiamondToMerchantProduct(diamond);
        if (merchantProduct) {
          batchMerchantProducts.push(merchantProduct);
        }
      }

      if (batchMerchantProducts.length > 0) {
        try {
          await this.merchantService.insertProducts(batchMerchantProducts);
          syncedCount += batchMerchantProducts.length;
        } catch (error) {
          Sentry.captureException(error);
        }
      }

      const totalFetched = (page - 1) * LIMIT + diamonds.length;
      if (totalFetched >= count) {
        hasMore = false;
      } else {
        page++;
      }
    }
    return syncedCount;
  }
}
