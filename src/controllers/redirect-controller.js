export default class RedirectController {
  static MAPPINGS = {
    "warranty-policy": "https://jemmia.vn/pages/chinh-sach-bao-hanh-va-thu-mua-thu-doi-san-pham",
    "return-and-exchange-policy": "https://jemmia.vn/pages/chinh-sach-bao-hanh-va-thu-mua-thu-doi-san-pham"
  };

  static async show(ctx) {
    const name = ctx.req.param("name");

    const url = RedirectController.MAPPINGS[name];
    if (!url) {
      ctx.res.status(404);
      return;
    }

    return ctx.redirect(url);
  }
}
