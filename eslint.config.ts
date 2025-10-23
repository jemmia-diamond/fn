import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "src/index.ts",
      "src/core/queue-handler.ts", 
      "src/core/schedule-handler.ts",
      "packages/v2/**/*",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.wrangler/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.cache/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { 
      globals: globals.node 
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
