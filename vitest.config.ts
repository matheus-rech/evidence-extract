import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  test: {
    environment: 'node',
    pool: 'vmThreads',
    maxWorkers: 1,
    exclude: ['node_modules/**', '.next/**', 'tests/e2e/**']
  }
});
