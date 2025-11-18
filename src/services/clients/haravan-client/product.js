import BaseConnector from "services/clients/haravan-client/base-connector";

class ProductConnector extends BaseConnector {
  async getProducts(options = {}) {
    return this.get("/products.json", options);
  }

  async countProducts() {
    return this.get("/products/count.json");
  }

  async getProduct(productId) {
    return this.get(`/products/${productId}.json`);
  }

  async createProduct(productData) {
    return this.post("/products.json", { product: productData });
  }

  async updateProduct(productId, productData) {
    return this.put(`/products/${productId}.json`, { product: productData });
  }

  async deleteProduct(productId) {
    return this.delete(`/products/${productId}.json`);
  }

  async addProductTags(productId, tags) {
    return this.post(`/products/${productId}/tags.json`, { tags });
  }

  async deleteProductTags(productId, tags) {
    return this.delete(`/products/${productId}/tags.json`, { tags });
  }
}

export default ProductConnector;
