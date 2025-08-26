export default class RedirectController {
  static MAPPINGS = {
    "warranty-policy": "https://jemmia.vn/pages/chinh-sach-bao-hanh-va-thu-mua-thu-doi-san-pham#:~:text=III.%20CH%C3%8DNH%20S%C3%81CH%20B%E1%BA%A2O%20H%C3%80NH",
    "return-and-exchange-policy": "https://jemmia.vn/pages/chinh-sach-bao-hanh-va-thu-mua-thu-doi-san-pham#:~:text=IV.%20CH%C3%8DNH%20S%C3%81CH%20THU%20MUA%20%E2%80%93%20THU%20%C4%90%E1%BB%94I",
    "order-tracking": "https://jemmia.vn/pages/tra-cuu-don-hang?order_id=1714590904"
  };

  static async show(ctx) {
    const name = ctx.req.param("name");

    const url = RedirectController.MAPPINGS[name];
    if (!url) {
      return ctx.text("Not Found", 404);
    }

    return ctx.redirect(url);
  }
}
