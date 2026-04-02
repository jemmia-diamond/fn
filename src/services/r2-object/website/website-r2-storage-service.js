import { R2StorageService } from "services/r2-object/core/r2-storage-service";

export class WebsiteR2StorageService extends R2StorageService {
  constructor(env) {
    super(env, "JEMMIA_ASSETS_R2_STORAGE");
    this.prefix = "website";
    this.bucketName = "assets";
  }

  async upload(filename, body) {
    const key = `${this.prefix}/${filename}`;
    await this._putObject(key, body, this.bucketName);

    const publicBaseUrl = this.env.R2_JEMMIA_WEBSITE_PUBLIC_URL;
    return `${publicBaseUrl}/${key}`;
  }

  async getObjectByKey(key) {
    return this._getObject(key);
  }

  async downloadObject(filename) {
    const key = `${this.prefix}/${filename}`;
    return this._downloadObject(key, this.bucketName);
  }
}
