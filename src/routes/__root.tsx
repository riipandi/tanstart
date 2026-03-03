import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { GlobalNotFound } from '#/components/boundaries'
import { UIProvider, ThemeProvider } from '#/components/provider'
import { AppDevTools } from '#/devtools'
import { getContext, RootProvider } from '#/provider'
import type { TRPCRouter } from '#/trpc/router'
import appCss from '../styles/globals.css?url'

export interface GlobalContext {
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<TRPCRouter>
}

export const Route = createRootRouteWithContext<GlobalContext>()({
  shellComponent: RootDocument,
  notFoundComponent: GlobalNotFound,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Better Start' }
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' }
    ]
  })
})

function RootDocument({ children }: React.PropsWithChildren) {
  const { queryClient } = getContext()

  return (
    <RootProvider queryClient={queryClient}>
      <ThemeProvider>
        <html lang='en' suppressHydrationWarning>
          <head>
            <HeadContent />
          </head>
          <body>
            <UIProvider>{children}</UIProvider>
            <AppDevTools queryClient={queryClient} />
            <Scripts />
          </body>
        </html>
      </ThemeProvider>
    </RootProvider>
  )
}
