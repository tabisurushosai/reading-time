import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "src/core must not import platform, UI, or adapter layers.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "chrome",
          message: "src/core must stay platform-independent; use an adapter outside core.",
        },
        {
          name: "browser",
          message: "src/core must stay platform-independent; use an adapter outside core.",
        },
        {
          name: "document",
          message: "src/core must stay DOM-independent; pass data in from the UI layer.",
        },
        {
          name: "window",
          message: "src/core must stay DOM-independent; pass data in from the UI layer.",
        },
        {
          name: "fetch",
          message: "src/core must stay offline and platform-independent.",
        },
        {
          name: "localStorage",
          message: "src/core must not access storage directly; use src/storage adapters.",
        },
        {
          name: "sessionStorage",
          message: "src/core must not access storage directly; use src/storage adapters.",
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  }
);
