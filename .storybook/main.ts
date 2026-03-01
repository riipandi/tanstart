import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@github-ui/storybook-addon-performance-panel'
  ],
  framework: '@storybook/react-vite',
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
    enableCrashReports: false
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()],
      build: { chunkSizeWarningLimit: 1024 * 4 }
    })
  },
  features: {
    backgrounds: false
  }
}

export default config
