import { generateText } from "ai";
import HaravanAPI from "services/clients/haravan-client/index.js";
import SyncHelper from "services/haravan/utils/sync-helper.js";
import { getOpenAICompatibleModel } from "services/utils/llm-helper.js";
import ImageTranslationService from "services/media/image-translation-service.js";

const AI_MODELS = {
  GEMINI_FLASH_LITE: "gemini-2.5-flash-lite"
};

const TRANSLATION_PROMPTS = {
  HTML: "Translate the following HTML content from Vietnamese to English. Requirements: Keep the entire HTML structure unchanged (tags, attributes, formatting, indentation). Only translate visible Vietnamese text content into English. Do NOT modify tag names, attribute names, attribute values, class names, IDs, inline styles, scripts, or URLs. Do NOT add, remove, or reorder any elements. Preserve special characters, entities, and whitespace. If text is already in English, keep it as is. Return ONLY the final translated HTML. Do not include explanations, comments, or any extra text. HTML to translate: ",
  TEXT: "Translate the following title from Vietnamese to English. Return ONLY the translated text. Title: "
};

export default class ArticleSyncService {
  static CONFIG = {
    FETCH_LIMIT: 50, // Articles per page
    SYNC_THRESHOLD_MS: 600000, // 10 min - VI must be newer than EN by this to trigger sync
    RECONCILE_BATCH_SIZE: 15 // Parallel processing batch size
  };

  static BLOG_ID_MAP = {
    1001010235: "1001036523", // Stone
    1001010234: "1001036524", //  Wedding Handbook
    1001010233: "1001036525", //  Jewellery Knowledge
    1001010232: "1001036526", //  Gold
    1001010230: "1001036527", //  Lifestyle
    1000951114: "1001036528", //  You may like
    1000951111: "1001036529", //  Latest
    1000951110: "1001036530", //  Trending
    1000950161: "1001036531", //  Events
    1000950159: "1001036532", //  Useful Information
    1000950158: "1001036533", //  Recruitment
    1000950163: "1001036534", //  Promotion
    1000950160: "1001036535", //  Diamond Knowledge
    1000634955: "1001036536" //  Press
  };

  constructor(env) {
    this.env = env;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async translateText(text, isHtml = true) {
    if (!text) return text;
    const prompt = isHtml
      ? TRANSLATION_PROMPTS.HTML + text
      : TRANSLATION_PROMPTS.TEXT + text;

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const provider = await getOpenAICompatibleModel(this.env);
        const model = provider(AI_MODELS.GEMINI_FLASH_LITE);
        const { text: content } = await generateText({
          model,
          prompt
        });

        return content.trim();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await this.sleep(1000 * Math.pow(2, attempt));
      }
    }
  }

  async fetchAllArticles(haravanClient, blogId, dateRange = null) {
    let all = [];
    let page = 1;
    let hasMore = true;
    const limit = ArticleSyncService.CONFIG.FETCH_LIMIT;

    let params = { limit, page };
    if (dateRange) {
      if (dateRange.min) params.updated_at_min = dateRange.min;
      if (dateRange.max) params.updated_at_max = dateRange.max;
    }

    while (hasMore) {
      try {
        const data = await haravanClient.article.getArticles(blogId, params);
        const articles = data.articles || [];
        all = all.concat(articles);
        if (articles.length < limit) hasMore = false;
        else {
          page++;
          params.page = page;
        }
      } catch {
        hasMore = false;
      }
    }
    return all;
  }

  getSignature(article) {
    const time = SyncHelper.normalizeDate(article.published_at) || "no-time";
    const imgPart = article.image
      ? (article.image.src.match(/([a-f0-9]{32})/i)?.[1] ||
          article.image.src.split("/").pop().split("?")[0]).replace(/^en_/, "")
      : "no-img";
    return `${time}|${imgPart}`;
  }

  async checkBlogPair(haravanClient, viBlogId, enBlogId, dateRange = null) {
    let viArticles = await this.fetchAllArticles(
      haravanClient,
      viBlogId,
      dateRange
    );
    let enArticles = await this.fetchAllArticles(
      haravanClient,
      enBlogId,
      dateRange
    );

    viArticles = viArticles.filter(
      (a) => !a.title.toLowerCase().includes("ladipage")
    );
    enArticles = enArticles.filter(
      (a) => !a.title.toLowerCase().includes("ladipage")
    );

    const viGroups = {};
    viArticles.forEach((v) => {
      const s = this.getSignature(v);
      if (!viGroups[s]) viGroups[s] = [];
      viGroups[s].push(v);
    });

    const enGroups = {};
    enArticles.forEach((e) => {
      const s = this.getSignature(e);
      if (!enGroups[s]) enGroups[s] = [];
      enGroups[s].push(e);
    });

    const matchedPairs = [];
    const missingArticles = [];
    const orphanEnArticles = [];

    const allSigs = new Set([
      ...Object.keys(viGroups),
      ...Object.keys(enGroups)
    ]);
    for (const sig of allSigs) {
      const viList = viGroups[sig] || [];
      const enList = enGroups[sig] || [];

      enList.sort((a, b) => {
        const aHasSuffix = /-\d+$/.test(a.handle);
        const bHasSuffix = /-\d+$/.test(b.handle);
        if (aHasSuffix !== bHasSuffix) return aHasSuffix ? 1 : -1;
        return a.id - b.id;
      });

      const min = Math.min(viList.length, enList.length);
      for (let i = 0; i < min; i++)
        matchedPairs.push({ vi: viList[i], en: enList[i] });
      if (viList.length > min) missingArticles.push(...viList.slice(min));
      if (enList.length > min) orphanEnArticles.push(...enList.slice(min));
    }

    return { matchedPairs, missingArticles, orphanEnArticles };
  }

  getImages(html) {
    if (!html) return [];
    const images = [];
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }
    return images;
  }

  async translateImagesInHtml(html, imageService) {
    if (!html) return html;
    const images = this.getImages(html);
    if (images.length === 0) return html;

    let updatedHtml = html;
    const batchSize = ArticleSyncService.CONFIG.RECONCILE_BATCH_SIZE;

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (src) => {
          let fullSrc = src.startsWith("//") ? "https:" + src : src;
          const result = await imageService.translateImage(fullSrc, this.env);
          if (result.success && result.isTranslated) {
            updatedHtml = updatedHtml.replace(
              new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              result.newUrl
            );
            return true;
          }
          return false;
        })
      );
    }
    return updatedHtml;
  }

  async translateFeaturedImage(src, imageService) {
    if (!src) return null;
    let fullSrc = src.startsWith("//") ? "https:" + src : src;
    const result = await imageService.translateImage(fullSrc, this.env);
    return result.success && result.isTranslated ? result.newUrl : src;
  }

  async sync() {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanAPI(HRV_API_KEY, this.env);
    const imageService = new ImageTranslationService();

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const dateRange = {
      min: yesterday.toISOString(),
      max: now.toISOString()
    };

    for (const viId of Object.keys(ArticleSyncService.BLOG_ID_MAP)) {
      const enId = ArticleSyncService.BLOG_ID_MAP[viId];
      const { matchedPairs, missingArticles, orphanEnArticles } =
        await this.checkBlogPair(haravanClient, viId, enId, dateRange);

      for (const pair of matchedPairs) {
        const structureSync = SyncHelper.isHtmlStructureSync(
          pair.vi.body_html,
          pair.en.body_html
        );
        const viUpdated = new Date(pair.vi.updated_at).getTime();
        const enUpdated = new Date(pair.en.updated_at).getTime();
        const sourceUpdated =
          viUpdated - enUpdated > ArticleSyncService.CONFIG.SYNC_THRESHOLD_MS;

        if (!structureSync || sourceUpdated) {
          const enTitle = await this.translateText(pair.vi.title, false);
          let enBody = await this.translateText(pair.vi.body_html, true);
          enBody = await this.translateImagesInHtml(enBody, imageService);
          const featuredImage = await this.translateFeaturedImage(
            pair.vi.image?.src,
            imageService
          );
          await haravanClient.article.updateArticle(enId, pair.en.id, {
            title: enTitle,
            body_html: enBody,
            author: pair.vi.author,
            image: featuredImage ? { src: featuredImage } : null
          });
        }
      }

      for (const orphan of orphanEnArticles) {
        await haravanClient.article.deleteArticle(enId, orphan.id);
      }

      for (const vi of missingArticles) {
        const enTitle = await this.translateText(vi.title, false);
        let enBody = await this.translateText(vi.body_html, true);
        enBody = await this.translateImagesInHtml(enBody, imageService);
        const featuredImage = await this.translateFeaturedImage(
          vi.image?.src,
          imageService
        );
        await haravanClient.article.createArticle(enId, {
          title: enTitle,
          body_html: enBody,
          author: vi.author,
          published_at: vi.published_at,
          image: featuredImage ? { src: featuredImage } : null
        });
      }
    }
  }
}
