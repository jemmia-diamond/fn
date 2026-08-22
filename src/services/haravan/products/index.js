import DatabaseSyncService from "services/haravan/products/database-sync-service";
import AutoAddToDiscountProgramService from "services/haravan/products/product/auto-add-to-discount-program-service";
import ProductVariantService from "services/haravan/products/product-variant/product-variant-service";

export default {
  ProductVariantService: ProductVariantService,
  AutoAddToDiscountProgramService: AutoAddToDiscountProgramService,
  DatabaseSyncService
};
