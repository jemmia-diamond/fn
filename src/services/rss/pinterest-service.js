import { createAxiosClient } from "services/utils/http-client";
import * as cheerio from "cheerio";

const httpClient = createAxiosClient();

export default class PinterestService {
  async getFeed(slug) {
    const url = `https://jemmia.vn/blogs/${slug}.atom`;
    const atomXml = await this.fetchFeed(url);
    return this.convertAtomToRss(atomXml, url);
  }

  // Fetches the feed content from the URL.
  async fetchFeed(url) {
    const response = await httpClient.get(url);
    return response.data;
  }

  // Converts Atom XML to RSS 2.0 XML.
  convertAtomToRss(atomXml, feedUrl) {
    const $ = cheerio.load(atomXml, { xmlMode: true });

    const feedTitle = $("feed > title").text();
    // Default to provided URL if alternate link is missing
    const feedLink = $("feed > link[rel=\"alternate\"]").attr("href") || feedUrl;
    const feedDescription = feedTitle;

    let rssItems = "";

    $("entry").each((index, element) => {
      rssItems += this.processEntry($, element);
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
    `.trim();
  }

  // Processes a single Atom entry and returns an RSS item string.
  processEntry($, element) {
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
    const imageLink = this.extractImage($, entry, content);

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
  extractImage($, entry, content) {
    let imageLink = entry.find("link[rel=\"alternate\"][type^=\"image/\"]").attr("href");

    if (!imageLink && content) {
      const content$ = cheerio.load(content, { xmlMode: false });
      imageLink = content$("img").first().attr("src");
    }

    if (imageLink && imageLink.startsWith("//")) {
      imageLink = "https:" + imageLink;
    }

    return imageLink;
  }
}
