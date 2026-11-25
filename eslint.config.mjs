// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/node_modules/', '**/dist/', '**/coverage/', '**/cdk.out/']),

  js.configs.recommended,

  // Type-aware rules: each file is checked with the tsconfig of its own workspace.
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['services/**/*.ts', 'infra/**/*.ts', '**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Lambda's Node.js runtime needs handlers to be async (or take a callback),
    // even before they await anything.
    files: ['services/**/handlers/**/*.ts'],
    rules: { '@typescript-eslint/require-await': 'off' },
  },

  // Last, so formatting is left entirely to Prettier.
  prettier,
);
