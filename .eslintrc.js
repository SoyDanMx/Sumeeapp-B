/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
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
};
