import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { type BreadcrumbValue, getContext, RootProvider } from './provider'
import { routeTree } from './routes.gen'

export function getRouter() {
  const { queryClient } = getContext()
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    Wrap: (props: React.PropsWithChildren) => {
      return <RootProvider queryClient={queryClient}>{props.children}</RootProvider>
    }
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbValue
  }
}
