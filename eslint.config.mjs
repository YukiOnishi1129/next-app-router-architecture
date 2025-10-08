import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const localRules = require("./eslint-local-rules");

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", ".git/**", "dist/**", "build/**"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "local-rules": { rules: localRules },
      prettier: prettierPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@typescript-eslint": tseslint,
      "@next/next": next.plugins["@next/next"],
    },
    rules: {
      "prettier/prettier": "error",
      ...next.rules,
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-type-checked"].rules,
      "local-rules/use-server-check": "error",
      "local-rules/use-client-check": "error",
      "local-rules/restrict-service-imports": "error",
      "local-rules/require-server-only": "error",
      "local-rules/restrict-action-imports": "error",
      "local-rules/use-nextjs-helpers": "error",
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "builtin", position: "before" },
            { pattern: "next", group: "builtin", position: "before" },
            { pattern: "next/**", group: "builtin", position: "before" },
            { pattern: "@/features/**", group: "internal", position: "before" },
            { pattern: "@/shared/**", group: "internal", position: "after" },
            { pattern: "@/external/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          warnOnUnassignedImports: false,
        },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/no-duplicates": ["error", { "prefer-inline": false }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
