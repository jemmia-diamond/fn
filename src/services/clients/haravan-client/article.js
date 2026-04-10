import BaseConnector from "services/clients/haravan-client/base-connector";

class ArticleConnector extends BaseConnector {
  constructor(accessToken) {
    super(accessToken);
    this.baseUrl = "https://apis.haravan.com/web";
  }

  async getArticles(blogId, options = {}) {
    return this.get(`/blogs/${blogId}/articles.json`, options);
  }

  async getArticle(blogId, articleId) {
    return this.get(`/blogs/${blogId}/articles/${articleId}.json`);
  }

  async createArticle(blogId, articleData) {
    return this.post(`/blogs/${blogId}/articles.json`, { article: articleData });
  }

  async updateArticle(blogId, articleId, articleData) {
    return this.put(`/blogs/${blogId}/articles/${articleId}.json`, { article: { id: articleId, ...articleData } });
  }

  async deleteArticle(blogId, articleId) {
    return this.delete(`/blogs/${blogId}/articles/${articleId}.json`);
  }
}

export default ArticleConnector;
