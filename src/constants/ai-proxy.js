export const AI_MODELS = {
  GPT_5_4: "gpt-5.4",
  GEMINI_3_1_FLASH_IMAGE_PREVIEW: "gemini-3.1-flash-image-preview",
  GEMINI_3_1_FLASH_LITE_PREVIEW: "gemini-3.1-flash-lite-preview"
};

export const TRANSLATION_PROMPTS = {
  HTML: "Translate the following HTML content from Vietnamese to English. Requirements: Keep the entire HTML structure unchanged (tags, attributes, formatting, indentation). Only translate visible Vietnamese text content into English. Do NOT modify tag names, attribute names, attribute values, class names, IDs, inline styles, scripts, or URLs. Do NOT add, remove, or reorder any elements. Preserve special characters, entities, and whitespace. If text is already in English, keep it as is. Return ONLY the final translated HTML. Do NOT include explanations, comments, or any extra text. HTML to translate: ",
  TEXT: "Translate the following title from Vietnamese to English. Return ONLY the translated text. Title: "
};
