import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      "no-debugger": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "no-duplicate-imports": "error",
      eqeqeq: ["warn", "always"],
    },
  },
];
