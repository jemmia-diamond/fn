import BaseConnector from "services/clients/haravan-client/base-connector";

class PageConnector extends BaseConnector {
  constructor(accessToken) {
    super(accessToken);
    this.baseUrl = "https://apis.haravan.com/web";
  }

  async getPages(options = {}) {
    return this.get("/pages.json", options);
  }

  async countPages() {
    return this.get("/pages/count.json");
  }

  async getPage(pageId) {
    return this.get(`/pages/${pageId}.json`);
  }

  async createPage(pageData) {
    return this.post("/pages.json", { page: pageData });
  }

  async updatePage(pageId, pageData) {
    return this.put(`/pages/${pageId}.json`, { page: { id: pageId, ...pageData } });
  }

  async deletePage(pageId) {
    return this.delete(`/pages/${pageId}.json`);
  }
}

export default PageConnector;
