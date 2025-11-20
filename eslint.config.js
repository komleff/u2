import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", "src/network/proto/**"]
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        KeyboardEvent: "readonly",
        structuredClone: "readonly",
        WebSocket: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        __dirname: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_", 
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-console": ["warn", { "allow": ["warn", "error", "debug", "info"] }],
      "no-unused-vars": "off",  // Disable base rule in favor of @typescript-eslint version
      "no-undef": "off"  // TypeScript handles this
    }
  },
  {
    files: ["scripts/**/*.mjs", "scripts/**/*.js", "ships/**/*.js"],
    languageOptions: {
      globals: {
        // Node.js globals
        process: "readonly",
        console: "readonly",
        crypto: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-empty": "warn",
      "no-unused-vars": "off"  // Disable for Node.js scripts
    }
  }
];
