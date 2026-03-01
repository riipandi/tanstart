import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro, type NitroPluginConfig } from 'nitro/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

const nitroConfig: NitroPluginConfig = {
  compatibilityDate: '2025-09-15',
  preset: 'node_server'
}

export default defineConfig({
  plugins: [
    devtools({ removeDevtoolsOnBuild: true }),
    nitro(nitroConfig),
    tailwindcss(),
    tanstackStart({
      router: {
        generatedRouteTree: resolve('./src/routes.gen.ts')
      }
    }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    }),
    tsconfigPaths({
      projects: [resolve('./tsconfig.json')],
      ignoreConfigErrors: true
    })
  ],
  build: {
    chunkSizeWarningLimit: 1024 * 4,
    minify: isProduction ? 'esbuild' : false
  },
  resolve: {
    alias: {
      '@': resolve('./src')
    }
  }
})
