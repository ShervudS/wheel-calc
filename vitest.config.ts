import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.spec.ts', 'build/**/__tests__/**/*.spec.ts'],
    environment: 'node',
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'build/**/*.ts'],
      exclude: ['src/main.ts', '**/*.d.ts', '**/__tests__/**'],
      reporter: ['text', 'html'],
      thresholds: {
        'src/core/**': { lines: 95, functions: 95, branches: 95, statements: 95 },
      },
    },
  },
});
