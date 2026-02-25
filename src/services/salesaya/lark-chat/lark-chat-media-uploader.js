export default class LarkChatMediaUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
  }

  async upload(buffer, filename, maxRetries = 3) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const form = new FormData();
        form.append("file", new Blob([buffer]), filename);
        const response = await fetch(this.uploadUrl, {
          method: "POST",
          body: form
        });

        const data = await response.json();
        return data?.url;
      } catch {
        attempt++;
        if (attempt > maxRetries) {
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}
