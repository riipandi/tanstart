import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'
import { routeTree } from './routes.gen'

export const getRouter = () => {
  const ctx = getContext()

  const router = createRouter({
    routeTree,
    context: { ...ctx },
    defaultPreload: 'intent'
  })

  setupRouterSsrQueryIntegration({ router, queryClient: ctx.queryClient })

  return router
}
