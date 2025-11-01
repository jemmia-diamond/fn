import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

import getBaseConfig from "./eslint/configs/base.js";
import getRoutesConfig from "./eslint/configs/routes.js";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  getBaseConfig(),
  getRoutesConfig()
]);
