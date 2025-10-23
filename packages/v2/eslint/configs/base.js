import globals from "globals";
import unusedImports from "eslint-plugin-unused-imports";
import noRelativeImports from "../rules/no-relative-imports.js";
import noVietnameseText from "../rules/no-vietnamese-text.js";
import stylistic from "@stylistic/eslint-plugin";
import unicorn from "eslint-plugin-unicorn";

export default function getBaseConfig() {
  return {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "unused-imports": unusedImports,
      "@stylistic": stylistic,
      unicorn: unicorn,
      custom: {
        rules: {
          "no-relative-imports": noRelativeImports,
          "no-vietnamese-text": noVietnameseText,
        },
      },
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
          argsIgnorePattern: "^_",
        },
      ],
      "no-debugger": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "eol-last": ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      indent: ["error", 2],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "unicorn/template-indent": [
        "error",
        {
          selectors: ["TemplateLiteral"],
          indent: 2,
        },
      ],
      "no-trailing-spaces": "error",
      "key-spacing": "error",
      "custom/no-relative-imports": "error",
      "custom/no-vietnamese-text": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='$queryRawUnsafe']",
          message:
            "Use of $queryRawUnsafe is not allowed. Use $queryRaw with proper parameterization instead.",
        },
        {
          selector: "MemberExpression[property.name='$executeRawUnsafe']",
          message:
            "Use of $executeRawUnsafe is not allowed. Use $executeRaw with proper parameterization instead.",
        },
      ],
    },
  };
}
