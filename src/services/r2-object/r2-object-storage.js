import * as Sentry from "@sentry/cloudflare";

export class R2StorageService {

  static getObjectFromR2 = async (env, key) => {
    if (!env || !env.JEMMIA_ERP_R2_STORAGE) {
      Sentry.captureException(new Error("Error: R2 binding 'JEMMIA_ERP_R2_STORAGE' not found on env object!"));
      return null;
    }

    if (!key) {
      Sentry.captureMessage("Error: No key provided to getObjectFromR2.");
      return null;
    }

    try {
      const object = await env.JEMMIA_ERP_R2_STORAGE.get(key);
      if (object === null) {
        Sentry.captureMessage(`Object with key "${key}" not found in R2.`);
        return null;
      }

      return object.arrayBuffer();
    } catch (err) {
      Sentry.captureException(err);
      return null;
    }
  };
}
