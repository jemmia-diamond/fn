import BaseConnector from "services/clients/haravan-client/base-connector";

class ProductImageConnector extends BaseConnector {
  async getImages(productId, options = {}) {
    return this.get(`/products/${productId}/images.json`, options);
  }

  async getImage(productId, imageId) {
    return this.get(`/products/${productId}/images/${imageId}.json`);
  }

  async createImage(productId, imageData) {
    return this.post(`/products/${productId}/images.json`, { image: imageData });
  }

  async updateImage(productId, imageId, imageData) {
    return this.put(`/products/${productId}/images/${imageId}.json`, { image: imageData });
  }

  async deleteImage(productId, imageId) {
    return this.delete(`/products/${productId}/images/${imageId}.json`);
  }
}

export default ProductImageConnector;
