import { App } from "core/types/app.type";
import { PancakeBindings } from "./bindings/pancake.binding";

const pancakeApp = new App<{ Bindings: PancakeBindings }>({
  path: '/pancake',
  routes: [],
});

export default pancakeApp;
