import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export default class ProductMapper {
  static mapProduct(product) {
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      tags: product.tags,
      variants: product.variants,
      images: product.images,
      created_at: product.created_at ? dayjs(product.created_at).utc().toDate() : null,
      updated_at: product.updated_at ? dayjs(product.updated_at).utc().toDate() : null,
      published_at: product.published_at ? dayjs(product.published_at).utc().toDate() : null,
      published_scope: product.published_scope,
      product_type: product.product_type,
      template_suffix: product.template_suffix,
      only_hide_from_list: product.only_hide_from_list,
      not_allow_promotion: product.not_allow_promotion,
      options: product.options
    };
  }

  static mapImage(image) {
    return {
      id: image.id ? BigInt(image.id) : null,
      product_id: image.product_id,
      src: image.src,
      position: image.position,
      filename: image.filename,
      variant_ids: image.variant_ids,
      created_at: image.created_at ? dayjs(image.created_at).utc().toDate() : null,
      updated_at: image.updated_at ? dayjs(image.updated_at).utc().toDate() : null
    };
  }

  static extractImages(product) {
    if (!product.images || !Array.isArray(product.images)) return [];

    return product.images.map(image => ({ ...image, product_id: product.id }));
  }
}
