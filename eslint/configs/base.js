import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";
import noRelativeImports from "../rules/no-relative-imports.js";
import noVietnameseText from "../rules/no-vietnamese-text.js";

export default function getBaseConfig() {
  return {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "unused-imports": unusedImports,
      "custom": {
        rules: {
          "no-relative-imports": noRelativeImports,
          "no-vietnamese-text": noVietnameseText
        }
      }
    },
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "comma-dangle": ["error", "never"],
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "no-debugger": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "eol-last": ["error", "always"],
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "indent": ["error", 2],
      "custom/no-relative-imports": "error",
      "custom/no-vietnamese-text": "error"
    }
  };
}
