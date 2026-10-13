import stylex from '@stylexjs/unplugin/vite'
import { EventEmitter } from 'node:events'
import { resolve } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * StyleX starts a dev HMR interval in configureServer and only clears it on
 * httpServer 'close'. Vitest's Vite server often has no httpServer, so the
 * interval keeps the process alive after tests finish.
 * (Same workaround as vite-react-template's vitest config.)
 */
function vitestStylexCleanup(): Plugin {
  let server: ViteDevServer | undefined
  const closeHttpServer = () => {
    server?.httpServer?.emit('close')
  }
  return {
    name: 'vitest-stylex-cleanup',
    enforce: 'pre',
    apply: 'serve',
    configureServer(devServer) {
      server = devServer
      if (!devServer.httpServer) {
        Object.assign(devServer, { httpServer: new EventEmitter() })
      }
    },
    buildEnd: closeHttpServer,
    closeWatcher: closeHttpServer
  }
}

export default defineConfig({
  plugins: [
    vitestStylexCleanup(),
    // Compile StyleX styles for unit tests (defineVars/create/createTheme).
    stylex({ useCSSLayers: true, aliases: { '#/*': resolve('./src/*') } })
  ],
  resolve: {
    alias: { '#': resolve('./src') }
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
