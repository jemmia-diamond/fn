import { createAxiosClient } from "services/utils/http-client";
import fetchAdapter from "@haverstack/axios-fetch-adapter";

export default class LarkChatMediaUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
    this.client = createAxiosClient({
      adapter: fetchAdapter
    });
  }

  async upload(buffer, filename) {
    const form = new FormData();
    form.append("file", new Blob([buffer]), filename);

    const { data } = await this.client.post(this.uploadUrl, form, {
      headers: {
        "Content-Type": null
      }
    });
    return data?.url;
  }
}
