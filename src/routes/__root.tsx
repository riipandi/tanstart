import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { getContext, type GlobalContext } from '#/provider'
import appCss from '../styles/globals.css?url'
import { GlobalNotFound, GlobalError } from './-boundaries'
import DevTools from './-devtools'
import { ThemeProvider } from './-theme'

export const Route = createRootRouteWithContext<GlobalContext>()({
  shellComponent: RootDocument,
  notFoundComponent: GlobalNotFound,
  errorComponent: GlobalError,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#5a58f2' },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#000d1a' },
      { name: 'description', content: 'TanStack Start Application' },
      { title: 'TanStack Start Starter' }
    ],
    links: [
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon.png' },
      { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: 'https://cdn.jsdelivr.net/fontsource/fonts/mona-sans:vf@latest/latin-wght-normal.woff2',
        crossOrigin: 'anonymous'
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono:vf@latest/latin-wght-normal.woff2',
        crossOrigin: 'anonymous'
      },
      { rel: 'stylesheet', href: appCss }
    ]
  })
})

function RootDocument(props: React.PropsWithChildren) {
  const { queryClient } = getContext()

  return (
    <ThemeProvider>
      <html lang='en' suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body className='isolate'>
          {props.children}
          <DevTools queryClient={queryClient} />
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  )
}
