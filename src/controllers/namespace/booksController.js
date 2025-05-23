export default class BooksController {
  static async index(ctx) {
    return ctx.text("books");
  }
};
