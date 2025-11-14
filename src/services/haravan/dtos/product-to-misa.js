export default class ProductToMisaMapper {
  static transform(products) {
    const variants = [];
    for (const product of products) {
      const {
        published_scope,
        handle,
        product_type,
        template_suffix,
        title: product_title,
        vendor: product_vendor
      } = product;

      for (const variant of product?.variants) {
        const enrichedVariant = {
          ...variant,
          product_id: String(variant.product_id || 0),
          published_scope,
          handle,
          product_type,
          template_suffix,
          product_title,
          product_vendor
        };
        variants.push(enrichedVariant);
      }
    }
    return variants;
  }
}
