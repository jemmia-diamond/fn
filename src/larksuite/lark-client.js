
export default class LarkClient {
  constructor({appId, appSecret}) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.tenantAccessToken = null;
  }
}
