import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router'
import { RootProvider } from 'fumadocs-ui/provider/tanstack'
import type * as React from 'react'
import { authClient } from '#/libraries/auth.client'
import appCss from '#/styles/globals.css?url'

interface GlobalContext {
  auth: {
    isAuthenticated: boolean
  }
}

export const Route = createRootRouteWithContext<GlobalContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Fumadocs on TanStack Start' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async ({ context }) => {
    // TODO: Fetch real auth state using `createServerFn`
    context.auth = {
      isAuthenticated: true,
    }
    return null
  },
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
})

function RootDocument({ children }: React.PropsWithChildren) {
  const { navigate } = useRouter()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <QueryClientProvider client={queryClient}>
          <AuthUIProvider
            authClient={authClient}
            navigate={(href) => navigate({ href })}
            replace={(href) => navigate({ href, replace: true })}
            Link={({ href, ...props }) => <Link to={href} {...props} />}
          >
            <RootProvider>{children}</RootProvider>
          </AuthUIProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
