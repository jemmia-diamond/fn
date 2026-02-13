import { createAxiosClient } from "services/utils/http-client";

export default class LarkChatMediaUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
    this.client = createAxiosClient();
  }

  async upload(buffer, filename) {
    const form = new FormData();
    form.append("file", new Blob([buffer]), filename);

    const { data } = await this.client.post(this.uploadUrl, form);
    return data?.url || data?.link || null;
  }
}
