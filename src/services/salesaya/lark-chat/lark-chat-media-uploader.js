export default class LarkChatMediaUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
  }

  async upload(buffer, filename) {
    const form = new FormData();
    form.append("file", new Blob([buffer]), filename);

    const res = await fetch(this.uploadUrl, { method: "POST", body: form });
    if (!res.ok) return null;

    const data = await res.json();
    return data?.url || data?.link || null;
  }
}
