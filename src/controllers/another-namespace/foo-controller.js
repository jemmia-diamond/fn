export default class FooController {
  static async index(ctx) {
    return ctx.text("foo");
  }
}
