import { generateText } from "ai";
import { getAIModel } from "services/utils/llm-helper.js";
import HaravanAPI from "services/clients/haravan-client/index.js";
import SyncHelper from "services/haravan/utils/sync-helper";
import { AI_MODELS, TRANSLATION_PROMPTS } from "src/constants/ai-proxy.js";
import * as Sentry from "@sentry/cloudflare";

export default class PageSyncService {
  static CONFIG = {
    FETCH_LIMIT: 50,
    FILTER_EXCLUDE_KEYWORDS: ["ladipage"],
    SYNC_THRESHOLD_MS: 300000, // 5 minutes
    RECONCILE_BATCH_SIZE: 15
  };

  constructor(env) {
    this.env = env;
  }

  /**
   * Synchronizes Haravan pages between Vietnamese and English versions.
   */
  async sync() {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanAPI(HRV_API_KEY);
    const model = await getAIModel(this.env, AI_MODELS.GPT_5_4);

    const allPages = await this.#fetchAndFilterPages(haravanClient);

    const viPages = allPages.filter(p => SyncHelper.isVietnamese(p.title));
    const enPages = allPages.filter(p => !SyncHelper.isVietnamese(p.title));

    const { matchedPairs, missingPages, orphanEnPages } = this.#matchPages(viPages, enPages);
    const outOfSyncPages = this.#filterOutOfSyncArticles(matchedPairs);

    await this.#reconcilePages(haravanClient, {
      model,
      outOfSyncPages,
      missingPages,
      orphanEnPages
    });
  }

  async #fetchAndFilterPages(haravanClient) {
    const { FETCH_LIMIT, FILTER_EXCLUDE_KEYWORDS } = PageSyncService.CONFIG;
    let all = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await haravanClient.page.getPages({ limit: FETCH_LIMIT, page });
        const pages = data.pages || [];
        if (pages.length === 0) {
          hasMore = false;
        } else {
          all = all.concat(pages);
          if (pages.length < FETCH_LIMIT) hasMore = false;
          else page++;
        }
      } catch (err) {
        hasMore = false;
        Sentry.captureException(err);
      }
    }

    return all.filter(p => {
      const lowerTitle = p.title.toLowerCase();
      const lowerBody = (p.body_html || "").toLowerCase();

      const isExcluded = FILTER_EXCLUDE_KEYWORDS.some(kw =>
        lowerTitle.includes(kw) || lowerBody.includes(kw)
      );
      const isEmpty = !p.body_html || p.body_html.trim() === "";

      return !isExcluded && !isEmpty;
    });
  }

  #matchPages(viPages, enPages) {
    const matchedPairs = [];
    const missingPages = [];
    const matchedEnIds = new Set();

    for (const vi of viPages) {
      const viTime = SyncHelper.normalizeDate(vi.published_at);
      const viStructure = SyncHelper.normalizeHtml(vi.body_html);

      // Signal 1: publication date match
      let match = enPages.find(en => !matchedEnIds.has(en.id) && SyncHelper.normalizeDate(en.published_at) === viTime);

      // Signal 2: structural match if date fails
      if (!match) {
        match = enPages.find(en => !matchedEnIds.has(en.id) && SyncHelper.normalizeHtml(en.body_html) === viStructure);
      }

      if (match) {
        matchedEnIds.add(match.id);
        matchedPairs.push({ vi, en: match });
      } else {
        missingPages.push(vi);
      }
    }

    const orphanEnPages = enPages.filter(en => !matchedEnIds.has(en.id));
    return { matchedPairs, missingPages, orphanEnPages };
  }

  #filterOutOfSyncArticles(matchedPairs) {
    const { SYNC_THRESHOLD_MS } = PageSyncService.CONFIG;
    return matchedPairs
      .filter(pair => {
        const structureSync = SyncHelper.isHtmlStructureSync(pair.vi.body_html, pair.en.body_html);
        const viUpdated = new Date(pair.vi.updated_at).getTime();
        const enUpdated = new Date(pair.en.updated_at).getTime();
        const sourceUpdated = (viUpdated - enUpdated) > SYNC_THRESHOLD_MS;
        return !structureSync || sourceUpdated;
      })
      .map(pair => {
        const structureSync = SyncHelper.isHtmlStructureSync(pair.vi.body_html, pair.en.body_html);
        return {
          ...pair,
          reason: !structureSync ? "[Structure Mismatch]" : "[Source Updated]"
        };
      });
  }

  async #reconcilePages(haravanClient, { model, outOfSyncPages, missingPages, orphanEnPages }) {
    const { RECONCILE_BATCH_SIZE } = PageSyncService.CONFIG;

    // Process Out-of-Sync
    for (let i = 0; i < outOfSyncPages.length; i++) {
      const { vi, en } = outOfSyncPages[i];
      await this.processOutOfSyncPage(haravanClient, vi, en.id, model);
    }

    // Process Missing (Creation)
    for (let i = 0; i < missingPages.length; i += RECONCILE_BATCH_SIZE) {
      const batch = missingPages.slice(i, i + RECONCILE_BATCH_SIZE);
      await Promise.all(batch.map(p => this.processMissingPage(haravanClient, p, model)));
    }

    // Delete Orphans
    for (const en of orphanEnPages) {
      try {
        await haravanClient.page.deletePage(en.id);
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  }

  async processMissingPage(haravanClient, viPage, model) {
    try {
      const { text: enTitle } = await generateText({ model, prompt: TRANSLATION_PROMPTS.TEXT + viPage.title });
      const { text: enBody } = await generateText({ model, prompt: TRANSLATION_PROMPTS.HTML + viPage.body_html });
      const newPage = {
        title: enTitle,
        author: viPage.author,
        body_html: enBody,
        published_at: viPage.published_at,
        template_suffix: viPage.template_suffix
      };
      await haravanClient.page.createPage(newPage);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  async processOutOfSyncPage(haravanClient, viPage, enPageId, model) {
    try {
      const { text: enTitle } = await generateText({ model, prompt: TRANSLATION_PROMPTS.TEXT + viPage.title });
      const { text: enBody } = await generateText({ model, prompt: TRANSLATION_PROMPTS.HTML + viPage.body_html });

      const updatedPage = {
        title: enTitle,
        body_html: enBody,
        published_at: viPage.published_at
      };
      await haravanClient.page.updatePage(enPageId, updatedPage);
    } catch (err) {
      Sentry.captureException(err);
    }
  }
}
