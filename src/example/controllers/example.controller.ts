import { Context } from 'hono';

export class ExampleController {
  public hello(ctx: Context) {
    return ctx.text('HELLO!');
  }

  public helloPost(ctx: Context) {
    return ctx.text('HELLO!');
  }
}
