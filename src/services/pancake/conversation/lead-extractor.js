import * as Sentry from "@sentry/cloudflare";
import { generateText } from "ai";
import MessageManagementConnector from "services/clients/lark-client/messaging/message-management";
import { formatPancakeMessages } from "services/pancake/conversation/conversation-formatter";
import { getOpenAICompatibleModel } from "services/utils/llm-helper";
import { AI_MODELS } from "src/constants/ai-proxy";
import {
  LEAD_EXTRACTION_PROVINCE_PROMPT,
  LEAD_EXTRACTION_SYSTEM_PROMPT,
  buildLeadUserPrompt
} from "src/constants/lead-extraction-prompt";

// Lark group that receives extraction-failure alerts (same chat the n8n
// "Pancake Conversation Failed Alert" posted to).
const LEAD_FAILURE_ALERT_CHAT_ID = "oc_63fa726af001dd2619008711dc96f33b";

/**
 * Parse the LLM response into an object, tolerating a ```json ... ``` wrapper.
 * Returns null when the text is not valid JSON.
 */
function parseJsonLoose(text) {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Sends the lead-extraction failure alert to Lark. Best-effort: never throws.
 */
export async function sendLeadExtractionFailureAlert(
  env,
  pageId,
  conversationId
) {
  try {
    const lark = new MessageManagementConnector(env);
    const content = JSON.stringify({
      text:
        "Lead Info Extractor có vấn đề rồi đại vương ơi. AI không extract được.\n" +
        `Info: page_id: ${pageId} conversation_id: ${conversationId}`
    });
    await lark.sendMessage(
      "chat_id",
      LEAD_FAILURE_ALERT_CHAT_ID,
      "text",
      content
    );
  } catch (error) {
    Sentry.captureException(error);
    console.warn(
      "Failed to send lead extraction failure alert:",
      error?.message
    );
  }
}

/**
 * In-`fn` replacement for the n8n "Lead Info Extractor" workflow brain. Fetches
 * the Pancake conversation, runs the extraction prompt against gemini via the AI
 * proxy, and writes the result into ERPNext via LeadService.
 *
 * Throws on transient failures (LLM/network error, non-JSON output) so the
 * MESSAGE_SUMMARY_QUEUE redelivers. A genuinely empty conversation is a no-op,
 * not a failure.
 */
export default class LeadExtractorService {
  constructor(env, pancakeClient, leadService) {
    this.env = env;
    this.pancakeClient = pancakeClient;
    this.leadService = leadService;
  }

  async run(pageId, conversationId) {
    if (!pageId || !conversationId) return { skipped: true };

    const res = await this.pancakeClient.getMessages(
      pageId,
      conversationId,
      crypto.randomUUID()
    );
    const rawMessages = res?.messages ?? [];
    const formatted = formatPancakeMessages(rawMessages, pageId);

    // "Detect cases" gate: nothing to extract from → no-op (do NOT throw).
    const hasConversation = formatted.length > 0;
    const hasCustomerMessage = formatted.some((m) => m.role === "user");
    if (!hasConversation || !hasCustomerMessage) {
      return { skipped: true };
    }

    const conversationJson = JSON.stringify(formatted);
    const nowIso = new Date().toISOString();

    const provider = await getOpenAICompatibleModel(this.env);
    const model = provider(AI_MODELS.GEMINI_2_5_FLASH_LITE);

    const { text } = await generateText({
      model,
      messages: [
        { role: "system", content: LEAD_EXTRACTION_SYSTEM_PROMPT },
        // n8n sent the province reference list as a "model" role message; the
        // OpenAI-compatible SDK uses "assistant" for the equivalent turn.
        { role: "assistant", content: LEAD_EXTRACTION_PROVINCE_PROMPT },
        { role: "user", content: buildLeadUserPrompt(conversationJson, nowIso) }
      ]
    });

    const data = parseJsonLoose(text);
    if (!data) {
      // Transient/parse failure → throw so the queue retries.
      throw new Error("Lead extraction: LLM returned non-JSON output");
    }

    // updateLeadInfoFromSummary applies its own field whitelist, so status /
    // reason / phone are dropped automatically (status quo preserved).
    return await this.leadService.updateLeadInfoFromSummary(
      data,
      conversationId
    );
  }
}
