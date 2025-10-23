import { App } from "../core/types/app.type";
import { ExampleController } from "./controllers/example.controller";

const exampleApp = new App({
    path: '/example',
    controllers: [ExampleController],
});

export default exampleApp;
