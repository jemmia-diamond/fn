export default class PhoneHelper {
  private static readonly ORIGINAL_PHONE_REGEX =
    /(?:\+?84|0)(?:3|5|7|8|9)[0-9]{8}\b/g;

  static extractPhones(text: string): string[] {
    return text.match(this.ORIGINAL_PHONE_REGEX) ?? [];
  }
}
