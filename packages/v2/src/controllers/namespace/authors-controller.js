export default class AuthorsController {
  static async index(ctx) {
    return ctx.text("authors");
  }

  static async show(ctx) {
    const { id } = ctx.req.param();

    return ctx.json({ id: id }, 200);
  }
}
