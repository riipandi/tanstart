import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '#': path.resolve('./src') }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.gen.ts',
        'src/routes.gen.ts',
        'src/**/*.{test,spec}.{ts,tsx}'
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0
      }
    }
  }
})
