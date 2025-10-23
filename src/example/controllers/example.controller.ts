import { BadRequestException, SuccessResponse } from 'core/types/response.type';
import { Context } from 'hono';

export class ExampleController {
  public hello(ctx: Context) {
    return new SuccessResponse({ message: ctx.req.path });
  }

  public helloPost(ctx: Context) {
    return new SuccessResponse({ message: ctx.req.path });
  }

  public helloException(ctx: Context) {
    throw new BadRequestException('Custom message', [
      {
        code: 'CODE',
        title: 'TITLE',
        detail: 'DETAIL',
      },
    ]);
  }
}
