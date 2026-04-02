import * as Sentry from "@sentry/cloudflare";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export class R2StorageService {
  /**
   * @param {object} env - The environment bindings object.
   * @param {string} bindingName - The name of the R2 bucket binding.
   */
  constructor(env, bindingName) {
    if (!env) {
      throw new Error("R2StorageService initialization failed: env is required.");
    }

    this.env = env;
    this.bindingName = bindingName;
    this.bucket = env[bindingName];
    this.s3Client = null;

    if (!this.bucket) {
      throw new Error(`R2 binding '${bindingName}' not found on env object.`);
    }
  }

  /**
   * Get or initialize the S3 client using secret bindings.
   * @returns {Promise<S3Client|null>}
   */
  async _createS3Client() {
    if (this.s3Client) {
      return this.s3Client;
    }

    const s3ApiUrl = this.env.S3_API_URL;
    const accessKeyId = await this.env.R2_ACCESS_KEY_ID_SECRET?.get();
    const secretAccessKey = await this.env.R2_SECRET_ACCESS_KEY_SECRET?.get();
    if (!s3ApiUrl || !accessKeyId || !secretAccessKey) {
      return null;
    }

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: s3ApiUrl,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    return this.s3Client;
  }

  /**
   * Get object as ArrayBuffer
   * @param {string} key
   * @returns {Promise<ArrayBuffer|null>}
   */
  async _getObject(key) {
    if (!key) {
      Sentry.captureMessage("Error: No key provided to getObject.");
      return null;
    }

    try {
      const object = await this.bucket.get(key);
      if (!object) {
        Sentry.captureMessage(`Object with key "${key}" not found in R2 (${this.bindingName}).`);
        return null;
      }
      return await object.arrayBuffer();
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  }

  /**
   * Put object using S3 SDK
   * @param {string} key
   * @param {any} body
   * @param {string} bucketName
   */
  async _putObject(key, body, bucketName) {
    const s3Client = await this._createS3Client();
    if (!s3Client) {
      throw new Error("S3 Client could not be initialized.");
    }

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body
      });
      return await s3Client.send(command);
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }

  /**
   * Download object using S3 SDK
   * @param {string} key
   * @param {string} bucketName
   * @returns {Promise<any>}
   */
  async _downloadObject(key, bucketName) {
    const s3Client = await this._createS3Client();

    if (!s3Client) {
      throw new Error("S3 Client could not be initialized.");
    }

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      const response = await s3Client.send(command);
      return response.Body;
    } catch (err) {
      Sentry.captureException(err);
      throw err;
    }
  }
}
