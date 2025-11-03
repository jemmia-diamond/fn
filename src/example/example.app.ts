import { ExampleRoute } from 'core/routes/example.route';
import { App } from '../core/types/app.type';

const exampleApp = new App({
  path: '/example',
  routes: [ExampleRoute],
});

export default exampleApp;
