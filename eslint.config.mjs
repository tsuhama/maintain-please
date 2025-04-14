import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  {
    ignores: [
      "**/coverage",
      "**/node_modules",
      "jest.config.cjs",
      "**/build",
      "**/*.test.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    plugins: {
      jest,
      prettier,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      "eslint-comments/no-use": "off",
    },
  },
]);
