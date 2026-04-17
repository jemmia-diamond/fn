import { generateText, generateImage } from "ai";
import { getOpenAICompatibleModel, getGoogleGenerativeAIModel } from "services/utils/llm-helper";
import { AI_MODELS } from "src/constants/ai-proxy";
import { v4 as uuidv4 } from "uuid";
import { WebsiteR2StorageService } from "services/r2-object/website/website-r2-storage-service";

/**
 * Service of image translation.
 */
export default class ImageTranslationService {
  /**
   * @param {Object} config
   * @param {string} [config.extractionModel]
   * @param {string} [config.generationModel]
   * @param {string} [config.targetLang]
   */
  constructor({
    extractionModel = AI_MODELS.GEMINI_3_1_FLASH_LITE_PREVIEW,
    generationModel = AI_MODELS.GEMINI_3_1_FLASH_IMAGE_PREVIEW,
    targetLang = "English"
  } = {}) {
    this.targetLang = targetLang;
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

    const model = await getOpenAICompatibleModel(env);

    try {
      const { text: contentStr } = await generateText({
        model: model(this.models.EXTRACTION),
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

      let content;
      try {
        content = JSON.parse(contentStr);
      } catch {
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
   * @param {string} mimeType
   * @returns {Promise<Uint8Array>} The translated image buffer.
   */
  async generateTranslatedImage(imageBuffer, metadata, env) {
    const prompt = this.prompts.GENERATE_IMAGE(metadata);
    const model = await getGoogleGenerativeAIModel(env);

    try {
      const { image } = await generateImage({
        model: model.image(this.models.GENERATION),
        prompt: {
          text: prompt,
          images: [imageBuffer]
        }
      });

      if (!image || !image.uint8Array) {
        throw new Error("AI SDK failed to return an image buffer");
      }

      return image.uint8Array;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch image from URL and return as ArrayBuffer with metadata.
   *
   * @param {string} imageUrl
   * @returns {Promise<{buffer: Uint8Array, name: string, mimeType: string}>}
   */
  async fetchImageFromUrl(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageUrl} (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const extension = contentType.split("/")[1]?.split(";")[0] || "jpg";

    const urlParts = imageUrl.split("/");
    const filename = urlParts[urlParts.length - 1].split("?")[0] || `image.${extension}`;

    return {
      buffer: new Uint8Array(arrayBuffer),
      name: filename,
      mimeType: contentType
    };
  }

  /**
   * Full translation pipeline.
   *
   * @param {File|string} image - File object or image URL
   * @param {Object} env
   * @returns {Promise<{success: boolean, isTranslated: boolean, newUrl?: string, originalUrl?: string}>}
   */
  async translateImage(image, env) {
    let imageBuffer;
    let imageName;

    if (typeof image === "string") {
      const imageData = await this.fetchImageFromUrl(image);
      imageBuffer = imageData.buffer;
      imageName = imageData.name;
    } else {
      const imageArrayBuffer = await image.arrayBuffer();
      imageBuffer = new Uint8Array(imageArrayBuffer);
      imageName = image.name;
    }

    const metadata = await this.extractMetadata(imageBuffer, env);

    if (metadata.length === 0) {
      return {
        success: true,
        isTranslated: false,
        newUrl: typeof image === "string" ? image : null
      };
    }

    const translatedImageBuffer = await this.generateTranslatedImage(imageBuffer, metadata, env);

    const uniqueId = uuidv4().split("-")[0];
    const extension = imageName.split(".").pop();
    const nameWithoutExt = imageName.substring(0, imageName.lastIndexOf("."));
    const outputFilename = `en_${nameWithoutExt}_${uniqueId}.${extension}`;

    // Save to R2
    const storage = new WebsiteR2StorageService(env);
    const publicUrl = await storage.upload(outputFilename, translatedImageBuffer);

    return {
      success: true,
      isTranslated: true,
      newUrl: publicUrl
    };
  }
}
