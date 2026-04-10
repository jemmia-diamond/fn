import * as cheerio from "cheerio";

export default class SyncHelper {
  static normalizeHtml(html) {
    if (!html) return "";
    try {
      const $ = cheerio.load(html, { decodeEntities: false });

      // Remove all text nodes and comments
      $("*")
        .contents()
        .filter(function () {
          return this.type === "text" || this.type === "comment";
        })
        .remove();

      // Keep and normalize src, href, remove other attributes
      $("*").each(function () {
        const el = $(this);
        const attrs = Object.keys(el.attr() || {});
        for (const attr of attrs) {
          if (attr.toLowerCase() === "src" || attr.toLowerCase() === "href") {
            let val = el.attr(attr);
            if (val) {
              const filename = val
                .split("/")
                .pop()
                .split("?")[0]
                .replace(/^en_/, "");
              el.attr(attr, filename);
            }
          } else {
            el.removeAttr(attr);
          }
        }
      });

      // Loop to remove empty tags (except basic self-closing tags)
      const selfClosingTags = [
        "img",
        "br",
        "hr",
        "input",
        "meta",
        "link",
        "source",
        "iframe"
      ];
      let changed;
      do {
        changed = false;
        $("*").each(function () {
          const el = $(this);
          if (
            el.children().length === 0 &&
            !selfClosingTags.includes(el[0].name.toLowerCase())
          ) {
            el.remove();
            changed = true;
          }
        });
      } while (changed);

      return $.html().replace(/\s+/g, "");
    } catch (e) {
      // Fallback if parsing fails
      console.warn("Error normalizing HTML:", e);
      return html.length.toString();
    }
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
