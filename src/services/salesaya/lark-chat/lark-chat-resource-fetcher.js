import path from "path";
import { URL } from "url";

export default class LarkChatResourceFetcher {
  constructor(env, client) {
    this.env = env;
    this.client = client;
  }

  async download(url) {
    const res = await this.client.get(url, { responseType: "arraybuffer" });
    const contentType = res.headers["content-type"];
    let filename = "unknown";

    const cd = res.headers["content-disposition"];
    if (cd) {
      const match = cd.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    } else {
      const urlPath = new URL(url).pathname;
      filename = path.basename(urlPath);
    }

    return {
      buffer: Buffer.from(res.data),
      filename,
      contentType,
      size: res.data.byteLength
    };
  }

  async getBufferByKey(messageId, fileKey, type) {
    const url = `${this.env.LARK_API_ENDPOINT}/open-apis/im/v1/messages/${messageId}/resources/${fileKey}?type=${type}`;
    const data = await this.download(url);
    return data.buffer;
  }
}
