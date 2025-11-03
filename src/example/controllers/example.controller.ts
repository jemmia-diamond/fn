import { BadRequestException, SuccessResponse } from 'core/types/response.type';
import { Context } from 'hono';

export class ExampleController {
  public hello(ctx: Context) {
    return new SuccessResponse({ message: 'Custom message' + ctx.req.path });
  }

  public helloPost() {
    return new SuccessResponse({ message: 'Custom message'});
  }

  public helloException() {
    throw new BadRequestException('Custom message', [
      {
        code: 'CODE',
        title: 'TITLE',
        detail: 'DETAIL',
      },
    ]);
  }
}
