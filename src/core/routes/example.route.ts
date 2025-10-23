import { validate } from 'core/middleware/validate.middleware';
import { Route } from 'core/types/route.type';
import { ExampleController } from 'example/controllers/example.controller';
import { ExamplePayload } from 'example/dto/example.dto';

export class ExampleRoute extends Route {
  private controller = new ExampleController();

  constructor() {
    super('/child-example');

    super.get('/hello', this.controller.hello);
    super.post('/hello', validate('json', ExamplePayload), this.controller.helloPost);
  }
}
