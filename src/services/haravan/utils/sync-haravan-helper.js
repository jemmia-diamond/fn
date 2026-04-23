export default class SyncHaravanHelper {
  static normalizeHtml(html) {
    if (!html) return "";
    let result = html
      .toLowerCase()
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<([a-z1-6]+)\s*([^>]*)>/gi, (match, tag, attrs) => {
        attrs = attrs || "";
        const srcMatch = attrs.match(/src=["\x27]([^"\x27]+)["\x27]/i);
        const hrefMatch = attrs.match(/href=["\x27]([^"\x27]+)["\x27]/i);
        let res = `<${tag}`;
        if (srcMatch) {
          const filename = srcMatch[1].split("/").pop().split("?")[0].replace(/^en_/, "");
          res += ` src="${filename}"`;
        }
        if (hrefMatch) {
          const filename = hrefMatch[1].split("/").pop().split("?")[0].replace(/^en_/, "");
          res += ` href="${filename}"`;
        }
        return res + ">";
      })
      .replace(/>[^<]+/g, ">")
      .replace(/[^>]+</g, "<")
      .replace(/\/>/g, ">")
      .replace(/\s+/g, "")
      .trim();

    let temp;
    do {
      temp = result;
      result = result.replace(/<([a-z1-6]+)\s*[^>]*><\/\1>/gi, "");
    } while (result !== temp);

    return result;
  }

  static isHtmlStructureSync(html1, html2) {
    return this.normalizeHtml(html1) === this.normalizeHtml(html2);
  }

  static normalizeDate(isoDate) {
    if (!isoDate) return null;
    try {
      return new Date(isoDate).toISOString().substring(0, 16);
    } catch {
      return null;
    }
  }
}
