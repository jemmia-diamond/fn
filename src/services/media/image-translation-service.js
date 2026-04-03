import { generateText } from "ai";
import { getAIModel } from "services/utils/llm-helper";
import { GoogleGenAI } from "@google/genai";

/**
 * Service of image translation.
 */
export default class ImageTranslationService {
  /**
   * @param {Object} config
   * @param {string} [config.extractionModel]
   * @param {string} [config.generationModel]
   * @param {string} [config.targetLang]
   * @param {string} [config.responseContentType]
   */
  constructor({
    extractionModel = "gpt-5.4",
    generationModel = "gemini-3.1-flash-image-preview",
    targetLang = "English",
    responseContentType = "image/jpeg"
  } = {}) {
    this.targetLang = targetLang;
    this.responseContentType = responseContentType;
    this.models = {
      EXTRACTION: extractionModel,
      GENERATION: generationModel
    };
    this.prompts = {
      EXTRACT_METADATA: (targetLang) => `
        Extract ALL text from this image. For each text:
        - Content (original Vietnamese)
        - Translated to natural ${targetLang} (MAINTAIN the same casing as original, e.g., if original is ALL CAPS, translation must be ALL CAPS)
        - Approximate position (top-left, center, bottom...)
        - Style description (cursive, bold, glitter, serif, size relative...)
        Return as a clean JSON array with keys: content_vi, translated, position, style.
        If NO Vietnamese text is found in the image, return an empty array [].
      `,

      GENERATE_IMAGE: (metadata) => `
        Replace the text in the image with the following translations. Keep EXACT same font style, size, color, glitter effect, spacing, and layout. Do not change background or any other elements. Here is the mapping:
        ${JSON.stringify(metadata, null, 2)}
        Return only the final edited image.
      `
    };
  }

  /**
   * Stage 1: Extract text, translation, position, and style from the image.
   *
   * @param {Uint8Array} imageBuffer
   * @param {Object} env
   * @returns {Promise<Array>} Metadata JSON array.
   */
  async extractMetadata(imageBuffer, env) {
    const prompt = this.prompts.EXTRACT_METADATA(this.targetLang);

    const modelResource = await getAIModel(env, this.models.EXTRACTION);

    try {
      const { text: contentStr } = await generateText({
        model: modelResource,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageBuffer }
            ]
          }
        ],
        responseFormat: { type: "json_object" }
      });

      // Try to parse JSON from content
      let content;
      try {
        content = JSON.parse(contentStr);
      } catch {
        // If not valid JSON, try to extract it from code blocks or cleanup
        const match = contentStr.match(/\[.*\]/s);
        if (match) {
          content = JSON.parse(match[0]);
        } else {
          throw new Error("Failed to parse JSON from AI response");
        }
      }

      const metadata = Array.isArray(content)
        ? content
        : content.text || content.data || Object.values(content)[0] || [];

      return metadata;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stage 2: Generate translated image using Google GenAI SDK.
   *
   * @param {Uint8Array} imageBuffer
   * @param {Array} metadata
   * @param {Object} env
   * @returns {Promise<Uint8Array>} The translated image buffer.
   */
  async generateTranslatedImage(imageBuffer, metadata, env) {
    const apiKey = await env.GOOGLE_API_KEY_SECRET.get();
    const model = this.models.GENERATION;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = this.prompts.GENERATE_IMAGE(metadata);

    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: Buffer.from(imageBuffer).toString("base64")
                }
              }
            ]
          }
        ]
      });

      // Check if response contains an image part
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData && p.inlineData.mimeType.startsWith("image/"));

      if (!imagePart) {
        throw new Error("Google GenAI failed to return an image");
      }

      const outputBase64 = imagePart.inlineData.data;
      return new Uint8Array(Buffer.from(outputBase64, "base64"));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Full translation pipeline.
   *
   * @param {Uint8Array} imageBuffer
   * @param {Object} env
   * @returns {Promise<Uint8Array>}
   */
  async translateImage(imageBuffer, env) {
    const metadata = await this.extractMetadata(imageBuffer, env);

    if (metadata.length === 0) {
      return imageBuffer;
    }

    const translatedImage = await this.generateTranslatedImage(imageBuffer, metadata, env);

    return translatedImage;
  }
}
