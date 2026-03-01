import { QueryClient } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { GlobalNotFound } from '#/components/boundaries'
import { getContext, Provider } from '#/integrations/tanstack-query/root-provider'
import type { TRPCRouter } from '#/integrations/trpc/router'
import { AppDevTools } from '#/lib/devtools'
import appCss from '../styles/globals.css?url'
import Header from './-header'

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
    links: [{ rel: 'stylesheet', href: appCss }]
  })
})

function RootDocument({ children }: React.PropsWithChildren) {
  const { queryClient } = getContext()

  return (
    <Provider queryClient={queryClient}>
      <html lang='en'>
        <head>
          <HeadContent />
        </head>
        <body>
          <Header />
          {children}
          <AppDevTools queryClient={queryClient} />
          <Scripts />
        </body>
      </html>
    </Provider>
  )
}
