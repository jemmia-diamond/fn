import BaseConnector from "services/clients/haravan-client/base-connector";

class ThemeConnector extends BaseConnector {
  constructor(accessToken) {
    super(accessToken);
    this.baseUrl = "https://apis.haravan.com/web";
  }

  async getAssets(themeId, params = {}) {
    return this.get(`/themes/${themeId}/assets.json`, params);
  }

  async updateAsset(themeId, assetData) {
    return this.put(`/themes/${themeId}/assets.json`, { asset: assetData });
  }
}

export default ThemeConnector;
