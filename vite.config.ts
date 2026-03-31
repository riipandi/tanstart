import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      router: {
        routesDirectory: path.resolve('./src/routes'),
        generatedRouteTree: path.resolve('./src/routes.gen.ts')
      }
    }),
    viteReact()
  ],
  resolve: {
    alias: { '#': path.resolve('./src') },
    tsconfigPaths: true
  },
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024 * 4,
    minify: isProduction ? 'oxc' : false,
    reportCompressedSize: false
  },
  server: { port: 3000 }
})
