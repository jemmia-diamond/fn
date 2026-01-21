export class PhoneDetectorHelper {
  private static readonly PHONE_REGEX =
    /(?:(?:\+|\bplus)(?:[\s\.-]*)\d{1,4}|\b(?:0|o|không|khong))(?:(?:[\s\._@\-]*)(?:[0-9oi]|một|mot|hai|ba|bốn|bon|tư|tu|năm|nam|sáu|sau|bảy|bay|tám|tam|chín|chin)){7,14}\b/gi;

  private static readonly ALLOWED_COUNTRY_CODES = ["+84"];

  private static readonly ALLOWED_LOCAL_PREFIXES = [
    "03",
    "05",
    "07",
    "08",
    "09", // Di động
    "02", // Máy bàn
  ];

  private static readonly REPLACEMENT_MAP: { [key: string]: string } = {
    plus: "+",
    o: "0",
    không: "0",
    khong: "0",
    i: "1",
    l: "1",
    một: "1",
    mot: "1",
    hai: "2",
    ba: "3",
    bốn: "4",
    bon: "4",
    tu: "4",
    năm: "5",
    nam: "5",
    sáu: "6",
    sau: "6",
    bảy: "7",
    bay: "7",
    tám: "8",
    tam: "8",
    chín: "9",
    chin: "9",
  };

  static detect(text: string): string[] {
    const matches = text.match(this.PHONE_REGEX);
    if (!matches) return [];

    const validPhones: string[] = [];
    for (const raw of matches) {
      const normalized = this.normalize(raw);
      if (this.isValid(normalized)) {
        validPhones.push(normalized);
      }
    }
    return validPhones;
  }

  static maskText(text: string): string {
    return text.replace(this.PHONE_REGEX, (match) => {
      const normalized = this.normalize(match);

      if (this.isValid(normalized)) {
        const firstPart = normalized.substring(0, 3);
        const lastPart = normalized.substring(normalized.length - 2);

        return `${firstPart}*****${lastPart}`;
      }

      return match;
    });
  }

  private static normalize(rawPhone: string): string {
    let processed = rawPhone.toLowerCase();

    const sortedKeys = Object.keys(this.REPLACEMENT_MAP).sort(
      (a, b) => b.length - a.length,
    );

    for (const key of sortedKeys) {
      const value = this.REPLACEMENT_MAP[key];
      processed = processed.split(key).join(value);
    }

    processed = processed.replace(/[^0-9+]/g, "");
    return processed;
  }

  private static isValid(phone: string): boolean {
    if (phone.startsWith("+")) {
      const isAllowedCountry = this.ALLOWED_COUNTRY_CODES.some((code) =>
        phone.startsWith(code),
      );
      return isAllowedCountry && phone.length >= 8;
    }

    const isAllowedLocal = this.ALLOWED_LOCAL_PREFIXES.some((prefix) =>
      phone.startsWith(prefix),
    );
    return isAllowedLocal && phone.length >= 10 && phone.length <= 11;
  }
}
