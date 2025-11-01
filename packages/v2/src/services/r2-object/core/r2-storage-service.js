import * as Sentry from "@sentry/cloudflare";

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

    if (!this.bucket) {
      throw new Error(`R2 binding '${bindingName}' not found on env object.`);
    }
  }

  /**
   * Get an object from R2.
   * @param {string} key - The object key.
   * @returns {Promise<ArrayBuffer|null>}
   */
  async _getObject(key) {
    if (!key) {
      Sentry.captureMessage("Error: No key provided to getObject.");
      return undefined;
    }

    try {
      const object = await this.bucket.get(key);
      if (!object) {
        Sentry.captureMessage(`Object with key "${key}" not found in R2 (${this.bindingName}).`);
        return undefined;
      }
      return await object.arrayBuffer();
    } catch (err) {
      Sentry.captureException(err);
      return undefined;
    }
  }
}
