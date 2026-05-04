import * as Sentry from "@sentry/cloudflare";

import { generateText } from "ai";

import HaravanClient from "services/clients/haravan-client";
import ImageTranslationService from "services/media/image-translation-service";

import { getOpenAICompatibleModel } from "services/utils/llm-helper";
import { retryQuery } from "services/utils/retry-utils";
import { sleep } from "services/utils/sleep";

import { TRANSLATION_PROMPTS, AI_MODELS } from "src/constants/ai-proxy";

export default class ConfigTranslatorService {
  static CONFIG = {
    THEME_ID: "1001480728", // id in theme "Translate Config Settings ( Fast )"
    KV_KEY: "haravan_config_snapshot",
    API_REQUEST_DELAY: 500,
    TRANSLATION_CONCURRENCY: 3
  };

  static IMAGE_URL_REGEX = /https?:\/\/[^\s"']+\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\s"']*)?/gi;

  constructor(env) {
    this.env = env;
  }

  async fetchHaravanConfig(haravanClient) {
    const endpoint = `/web/themes/${ConfigTranslatorService.CONFIG.THEME_ID}/assets.json?asset[key]=config/settings_data.json`;

    return retryQuery(async () => {
      const response = await haravanClient.makeRequest(endpoint, { method: "GET" });
      return response;
    });
  }

  async updateHaravanConfig(haravanClient, configValue) {
    const endpoint = `/web/themes/${ConfigTranslatorService.CONFIG.THEME_ID}/assets.json`;
    const payload = {
      asset: {
        key: "config/settings_data.json",
        value: configValue
      }
    };

    return retryQuery(async () => {
      const response = await haravanClient.makeRequest(endpoint, {
        method: "PUT",
        body: payload
      });
      return response;
    });
  }

  async getSnapshotFromKV() {
    const snapshot = await this.env.FN_KV.get(ConfigTranslatorService.CONFIG.KV_KEY, "json");
    return snapshot;
  }

  async saveSnapshotToKV(config) {
    await this.env.FN_KV.put(
      ConfigTranslatorService.CONFIG.KV_KEY,
      JSON.stringify(config)
    );
  }

  findChangedKeys(currentConfig, previousConfig) {
    if (!previousConfig) {
      return { allKeys: true, changedPaths: [] };
    }

    const changedPaths = [];

    const traverse = (current, previous, path = "") => {
      if (current === null || typeof current !== "object") {
        if (current !== previous) {
          changedPaths.push(path);
        }
        return;
      }

      if (!previous || typeof previous !== "object") {
        changedPaths.push(path);
        return;
      }

      const allKeys = new Set([...Object.keys(current), ...Object.keys(previous)]);

      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const currentValue = current[key];
        const previousValue = previous[key];

        if (!(key in previous)) {
          changedPaths.push(currentPath);
        } else if (!(key in current)) {
          changedPaths.push(currentPath);
        } else if (typeof currentValue !== typeof previousValue) {
          changedPaths.push(currentPath);
        } else if (typeof currentValue === "string") {
          if (currentValue !== previousValue) {
            changedPaths.push(currentPath);
          }
        } else {
          traverse(currentValue, previousValue, currentPath);
        }
      }
    };

    traverse(currentConfig, previousConfig);

    return { allKeys: false, changedPaths };
  }

  isImageUrl(value) {
    if (typeof value !== "string") return false;
    return ConfigTranslatorService.IMAGE_URL_REGEX.test(value);
  }

  isVietnameseText(value) {
    if (typeof value !== "string" || value.trim().length === 0) return false;
    const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
    return viRegex.test(value);
  }

  async translateText(text) {
    if (!text || !this.isVietnameseText(text)) return text;

    const prompt = TRANSLATION_PROMPTS.TEXT + text;
    const provider = await getOpenAICompatibleModel(this.env);
    const model = provider(AI_MODELS.GEMINI_2_5_FLASH_LITE);

    return retryQuery(async () => {
      const { text: content } = await generateText({ model, prompt });
      return content.trim();
    });
  }

  async translateHtml(html) {
    if (!html || typeof html !== "string") return html;
    if (!this.isVietnameseText(html)) return html;

    const prompt = TRANSLATION_PROMPTS.HTML + html;
    const provider = await getOpenAICompatibleModel(this.env);
    const model = provider(AI_MODELS.GEMINI_2_5_FLASH_LITE);

    return retryQuery(async () => {
      const { text: content } = await generateText({ model, prompt });
      return content.trim();
    });
  }

  async translateImageUrl(imageUrl, imageService) {
    if (!imageUrl || typeof imageUrl !== "string") return imageUrl;

    return retryQuery(async () => {
      const newUrl = await imageService.translateImage(imageUrl, this.env);
      return typeof newUrl === "string" ? newUrl : imageUrl;
    }).catch(error => {
      Sentry.captureException(error, {
        extra: { imageUrl, action: "translateImageUrl" }
      });
      return imageUrl;
    });
  }

  async processValue(value, imageService) {
    if (typeof value !== "string") return value;

    if (this.isImageUrl(value)) {
      return this.translateImageUrl(value, imageService);
    }

    if (value.includes("<") && value.includes(">")) {
      return this.translateHtml(value);
    }

    return this.translateText(value);
  }

  isPathChanged(currentPath, changedPaths, allKeys) {
    if (allKeys) return true;
    if (changedPaths.length === 0) return false;
    return changedPaths.some(changedPath =>
      currentPath === changedPath || currentPath.startsWith(changedPath + ".") || changedPath.startsWith(currentPath + ".")
    );
  }

  async applyTranslations(config, changedPaths, allKeys, imageService) {
    const translatedConfig = JSON.parse(JSON.stringify(config));
    const translationTasks = [];

    const collectTranslations = (obj, path = "") => {
      if (obj === null || typeof obj !== "object") return;

      for (const key of Object.keys(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];

        if (typeof value === "string") {
          const shouldTranslate = this.isPathChanged(currentPath, changedPaths, allKeys);

          if (shouldTranslate && this.isVietnameseText(value)) {
            translationTasks.push(async () => {
              obj[key] = await this.processValue(value, imageService);
            });
          }
        } else if (value && typeof value === "object") {
          collectTranslations(value, currentPath);
        }
      }
    };

    collectTranslations(translatedConfig);

    for (let i = 0; i < translationTasks.length; i += ConfigTranslatorService.CONFIG.TRANSLATION_CONCURRENCY) {
      const batch = translationTasks.slice(i, i + ConfigTranslatorService.CONFIG.TRANSLATION_CONCURRENCY);
      await Promise.all(batch.map(task => task()));
      await sleep(ConfigTranslatorService.CONFIG.API_REQUEST_DELAY);
    }

    return translatedConfig;
  }

  async sync() {
    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanClient(HRV_API_KEY, this.env.HARAVAN_API_BASE_URL);
      const imageService = new ImageTranslationService();

      const response = await this.fetchHaravanConfig(haravanClient);
      const asset = response?.asset;

      if (!asset || !asset.value) {
        console.warn("No config asset found from Haravan API");
        return;
      }

      let currentConfig;
      try {
        currentConfig = JSON.parse(asset.value);
      } catch (error) {
        Sentry.captureException(error, {
          extra: { action: "parseCurrentConfig" }
        });
        return;
      }

      const previousConfig = await this.getSnapshotFromKV();

      const { allKeys, changedPaths } = this.findChangedKeys(currentConfig, previousConfig);

      if (!allKeys && changedPaths.length === 0) {
        console.warn("No changes detected in config, skipping translation");
        return;
      }

      console.warn(`Detected ${allKeys ? "all keys (first run)" : changedPaths.length + " changed keys"}, starting translation...`);

      const translatedConfig = await this.applyTranslations(currentConfig, changedPaths, allKeys, imageService);

      const translatedValue = JSON.stringify(translatedConfig, null, 2);

      await this.updateHaravanConfig(haravanClient, translatedValue);

      await this.saveSnapshotToKV(currentConfig);

      console.warn("Config translation completed and snapshot saved");
    } catch (error) {
      Sentry.captureException(error, {
        extra: { action: "configTranslatorSync" }
      });
    }
  }
}
