import { createAxiosClient } from "services/utils/http-client";

const httpClient = createAxiosClient();

export default class LarkChatMediaUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
  }

  async upload(buffer, filename) {
    const form = new FormData();
    form.append("file", new Blob([buffer]), filename);

    const { data } = await httpClient.post(this.uploadUrl, form);
    return data?.url || data?.link || null;
  }
}
