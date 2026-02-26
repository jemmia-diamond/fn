import normalizePhoneNumber from "services/utils/normalize-phone-number";
import PhoneHelper from "services/utils/phone-helper";

export class ShieldPhoneHashLabeler {
  private static readonly MASKED_PHONE_REGEX = /\d{3}\*{5}\d{4}/g;

  static async hashPhone(phone: string): Promise<string> {
    const normalized = normalizePhoneNumber(phone);
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex.slice(0, 6);
  }

  static async attachLabelsToMasked(
    original: string,
    masked: string
  ): Promise<string> {
    const originalPhones = PhoneHelper.extractPhones(original);
    const maskedMatches = this.extractMaskedMatches(masked);

    if (originalPhones.length === 0 || maskedMatches.length === 0) {
      return masked;
    }

    return await this.appendHashLabels(masked, maskedMatches, originalPhones);
  }

  private static extractMaskedMatches(masked: string): RegExpMatchArray[] {
    const maskedMatches: RegExpMatchArray[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(this.MASKED_PHONE_REGEX);
    while ((match = regex.exec(masked)) !== null) {
      maskedMatches.push(match);
    }
    return maskedMatches;
  }

  private static async appendHashLabels(
    masked: string,
    maskedMatches: RegExpMatchArray[],
    originalPhones: string[]
  ): Promise<string> {
    let result = masked;
    for (let i = maskedMatches.length - 1; i >= 0; i--) {
      const phoneIndex = Math.min(i, originalPhones.length - 1);
      const originalPhone = originalPhones[phoneIndex];

      const currentMatch = maskedMatches[i];
      const maskedStr = currentMatch[0];
      const matchIndex = currentMatch.index!;

      const label = await this.hashPhone(originalPhone);

      const before = result.substring(0, matchIndex + maskedStr.length);
      const after = result.substring(matchIndex + maskedStr.length);

      result = `${before} \`#${label}\`${after}`;
    }
    return result;
  }
}
