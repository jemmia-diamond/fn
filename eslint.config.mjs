import { includeIgnoreFile } from "@eslint/compat";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

import getBaseConfig from "./eslint/configs/base.js";
import getRoutesConfig from "./eslint/configs/routes.js";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  ...tseslint.configs.recommended,
  getBaseConfig(),
  getRoutesConfig(),
  eslintConfigPrettier
]);
