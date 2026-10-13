import { cloudflare } from '@cloudflare/vite-plugin'
import stylex from '@stylexjs/unplugin/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_'],
  plugins: [
    stylex({
      aliases: { '#/*': resolve('./src/*') },
      enableDevClassNames: !isProduction,
      useCSSLayers: { before: ['reset'], prefix: 'stylex' }
    }),
    devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      router: {
        routesDirectory: resolve('./src/routes'),
        generatedRouteTree: resolve('./src/routes.gen.ts')
      }
    }),
    react({ compiler: true })
  ],
  resolve: { tsconfigPaths: true },
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024 * 4,
    minify: isProduction ? 'oxc' : false,
    reportCompressedSize: false
  },
  server: { port: 3000, strictPort: true }
})
