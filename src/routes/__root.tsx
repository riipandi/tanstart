import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRootRoute,
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
import { useDynamicFavicon } from '#/hooks/use-dynamic-favicon'

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Fumadocs on TanStack Start' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
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

  useDynamicFavicon()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <QueryClientProvider client={queryClient}>
          <AuthUIProvider
            redirectTo="/account/profile"
            authClient={authClient}
            navigate={(href) => navigate({ href })}
            replace={(href) => navigate({ href, replace: true })}
            Link={({ href, ...props }) => <Link to={href} {...props} />}
            account={true}
            avatar={true}
            apiKey={{ prefix: 'ak_' }}
            deleteUser={true}
            organization={true}
            teams={true}
            credentials={true}
            signUp={true}
            changeEmail={true}
            emailVerification={true}
            emailOTP={true}
            gravatar={true}
            magicLink={true}
            nameRequired={true}
            passkey={true}
            social={{ providers: ['github'] }}
          >
            <RootProvider>{children}</RootProvider>
          </AuthUIProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
