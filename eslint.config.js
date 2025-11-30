import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow exports in test files
      'react-refresh/only-export-components': [
        'warn',
        { 
          allowExportNames: ['render', 'screen', 'fireEvent', 'waitFor', 'within', 'act'],
          allowConstantExport: true 
        }
      ],
    },
  },
  {
    // Relax rules for test files and hook files (hooks need to export non-components)
    files: ['**/*.test.{ts,tsx}', '**/test-utils.tsx', '**/__tests__/**/*.{ts,tsx}', '**/hooks/**/*.{ts,tsx}', '**/context/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
