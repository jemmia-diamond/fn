import { defineConfig } from "eslint/config";
import getBaseConfig from "./eslint/configs/base.js";
import getRoutesConfig from "./eslint/configs/routes.js";

export default defineConfig([
  getBaseConfig(),
  getRoutesConfig()
]);
