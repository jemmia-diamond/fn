import BaseConnector from "services/clients/haravan-client/base-connector";

class ProductVariantConnector extends BaseConnector {
  async getVariants(productId, options = {}) {
    return this.get(`/products/${productId}/variants.json`, options);
  }

  async getVariant(variantId) {
    return this.get(`/variants/${variantId}.json`);
  }

  async createVariant(productId, variantData) {
    return this.post(`/products/${productId}/variants.json`, { variant: variantData });
  }

  async updateVariant(variantId, variantData) {
    return this.put(`/variants/${variantId}.json`, { variant: variantData });
  }

  async deleteVariant(productId, variantId) {
    return this.delete(`/products/${productId}/variants/${variantId}.json`);
  }
}

export default ProductVariantConnector;
