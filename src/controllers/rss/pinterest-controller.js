import PinterestService from "services/rss/pinterest-service";

export default class PinterestController {
  static async index(ctx) {
    const { slug } = ctx.req.param();

    if (!slug) {
      return ctx.json({ error: "Missing 'slug' query parameter" }, 400);
    }

    const pinterestService = new PinterestService();
    const rssXml = await pinterestService.getFeed(slug);

    return ctx.body(rssXml, 200, {
      "Content-Type": "application/xml"
    });
  }
}
