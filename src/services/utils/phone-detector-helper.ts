export class PhoneDetectorHelper {
  private static readonly PHONE_REGEX =
    /(?:(?:\+|\bplus)(?:[\s\.-]*)\d{1,4}|\b(?:0|o|khong))(?:(?:[\s\._@\-]*)(?:[0-9oi]|mot|hai|ba|bon|tu|nam|sau|bay|tam|chin)){7,14}\b/gi;

  private static readonly ALLOWED_COUNTRY_CODES = ["+84"];

  private static readonly ALLOWED_LOCAL_PREFIXES = [
    "03",
    "05",
    "07",
    "08",
    "09",
    "02",
  ];

  private static readonly REPLACEMENT_MAP: { [key: string]: string } = {
    plus: "+",
    o: "0",
    khong: "0",
    i: "1",
    l: "1",
    mot: "1",
    hai: "2",
    ba: "3",
    bon: "4",
    tu: "4",
    nam: "5",
    sau: "6",
    bay: "7",
    tam: "8",
    chin: "9",
  };

  static detect(text: string): string[] {
    const cleanText = this.stripAccents(text);
    const matches = cleanText.match(this.PHONE_REGEX);
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
    const nfcText = text.normalize("NFC");
    const cleanText = this.stripAccents(nfcText);
    const matches = Array.from(cleanText.matchAll(this.PHONE_REGEX));

    let result = nfcText;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const normalized = this.normalize(match[0]);

      if (this.isValid(normalized)) {
        const start = match.index!;
        const end = start + match[0].length;
        const firstPart = normalized.substring(0, 3);
        const lastPart = normalized.substring(normalized.length - 2);

        const masked = `${firstPart}*****${lastPart}`;
        result = result.substring(0, start) + masked + result.substring(end);
      }
    }
    return result;
  }

  private static normalize(rawPhone: string): string {
    let processed = this.stripAccents(rawPhone.toLowerCase());

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

  private static stripAccents(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }
}
