import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'src/index.ts',
      'src/core/queue-handler.ts',
      'src/core/schedule-handler.ts',
      'packages/v2/**/*',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.wrangler/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.cache/**',
    ],
  },
  js.configs.recommended,
  unicorn.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            err: true,
            req: true,
            res: true,
            env: true,
            ctx: true,
            args: true,
          },
          checkDefaultAndNamespaceImports: false,
          checkShorthandProperties: false,
        },
      ],
    },
  },
];
