/**
 * Utility class for Haravan synchronization tasks.
 */
export default class SyncHelper {
  /**
   * Normalizes HTML content by removing tags, attributes, and whitespace.
   * Keeps only the bare structural skeleton (src/href) for comparison.
   * @param {string} html
   * @returns {string} Normalized structural HTML
   */
  static normalizeHtml(html) {
    if (!html) return "";
    let result = html
      .toLowerCase()
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<([a-z1-6]+)\s*([^>]*)>/gi, (match, tag, attrs) => {
        attrs = attrs || "";
        const src = attrs.match(/src=["\x27]([^"\x27]+)["\x27]/i);
        const href = attrs.match(/href=["\x27]([^"\x27]+)["\x27]/i);
        let res = `<${tag}`;
        if (src) res += ` src="${src[1].split("?")[0]}"`;
        if (href) res += ` href="${href[1]}"`;
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

  /**
   * Compares two HTML strings and returns true if their structure is identical.
   * @param {string} html1
   * @param {string} html2
   * @returns {boolean}
   */
  static isHtmlStructureSync(html1, html2) {
    return this.normalizeHtml(html1) === this.normalizeHtml(html2);
  }

  /**
   * Detects if a string contains Vietnamese characters.
   * @param {string} text
   * @returns {boolean}
   */
  static isVietnamese(text) {
    if (!text) return false;
    return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
  }

  /**
   * Normalizes a date string to a consistent format (YYYY-MM-DDTHH:mm) for comparison.
   * @param {string} isoDate
   * @returns {string|null}
   */
  static normalizeDate(isoDate) {
    if (!isoDate) return null;
    try {
      return new Date(isoDate).toISOString().substring(0, 16);
    } catch {
      return null;
    }
  }
}
