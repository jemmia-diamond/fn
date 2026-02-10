import PresidioClient from "services/clients/presidio-client";

export default class JemmiaShieldPresidioService {
  static async detectSensitiveInfo(env: any, text: string) {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.analyze({ text });
    return result.some((item) => item.score > 0.3);
  }

  static async maskSensitiveInfo(env: any, text: string): Promise<string> {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.anonymize({ text });
    return result.text;
  }

  static async analyzeImage(env: any, imageBuffer: Buffer) {
    const presidioClient = new PresidioClient(env);
    return await presidioClient.analyzeImage(imageBuffer);
  }
}
