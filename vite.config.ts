import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    mdx(await import('./source.config')),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart({
      router: { generatedRouteTree: './routes.gen.ts' },
      prerender: { enabled: true },
    }),
    tailwindcss(),
    react(),
    nitro(),
  ],
  server: { port: 3000 },
})
