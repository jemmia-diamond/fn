import axios from "axios";
import * as cheerio from "cheerio";

const PINTEREST_USER_AGENT = "Mozilla/5.0 (compatible; PinterestBot/1.0; +http://www.pinterest.com/bot.html)";

export default class PinterestController {
  static async index(ctx) {
    const url = ctx.req.query("url");

    if (!url) {
      return ctx.json({ error: "Missing 'url' query parameter" }, 400);
    }

    const atomXml = await PinterestController._fetchFeed(url);
    const rssXml = PinterestController._convertAtomToRss(atomXml, url);

    return ctx.body(rssXml, 200, {
      "Content-Type": "application/xml"
    });
  }

  // Fetches the feed content from the URL.
  static async _fetchFeed(url) {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": PINTEREST_USER_AGENT
      }
    });
    return response.data;
  }

  // Converts Atom XML to RSS 2.0 XML.
  static _convertAtomToRss(atomXml, feedUrl) {
    const $ = cheerio.load(atomXml, { xmlMode: true });

    const feedTitle = $("feed > title").text();
    // Default to provided URL if alternate link is missing
    const feedLink = $("feed > link[rel=\"alternate\"]").attr("href") || feedUrl;
    const feedDescription = feedTitle;

    let rssItems = "";

    $("entry").each((index, element) => {
      rssItems += PinterestController._processEntry($, element);
    });

    return `
      <?xml version="1.0" encoding="UTF-8"?>
                          <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
                          <channel>
                              <title>${feedTitle}</title>
                              <link>${feedLink}</link>
                              <description>${feedDescription}</description>
                              <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
                              ${rssItems}
                          </channel>
                      </rss>
    `;
  }

  // Processes a single Atom entry and returns an RSS item string.
  static _processEntry($, element) {
    const entry = $(element);

    const title = entry.find("title").text();
    const link = entry.find("link[rel=\"alternate\"]").attr("href");
    const id = entry.find("id").text();
    const updated = entry.find("updated").text();

    let content = entry.find("content").text();
    if (!content) {
      content = entry.find("summary").text();
    }

    const pubDate = new Date(updated).toUTCString();
    const imageLink = PinterestController._extractImage($, entry, content);

    let mediaTag = "";
    if (imageLink) {
      mediaTag = `<enclosure url="${imageLink}" type="image/jpeg" />`;
    }

    return `
      <item>
        <title><![CDATA[${title}]]></title>
        <link>${link}</link>
        <guid>${id}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${content}]]></description>
        ${mediaTag}
      </item>
    `;
  }

  // Extracts the best suitable image for the entry.
  static _extractImage($, entry, content) {
    // 1. Try explicit image link in Atom feed
    let imageLink = entry.find("link[rel=\"alternate\"][type^=\"image/\"]").attr("href");

    // 2. Fallback to first image in content
    if (!imageLink && content) {
      const content$ = cheerio.load(content, { xmlMode: false });
      imageLink = content$("img").first().attr("src");
    }

    // 3. Fix protocol-relative URLs
    if (imageLink && imageLink.startsWith("//")) {
      imageLink = "https:" + imageLink;
    }

    return imageLink || null;
  }
}
