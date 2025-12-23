import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { DefaultCatchBoundary, NotFound } from '#/components/boundaries'
import { routeTree } from './routes.gen'

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultPreload: 'intent',
    scrollRestoration: true,
    context: {
      // auth will initially be undefined
      // We'll be passing down the auth state from within a React component
      auth: undefined!,
    },
  })
}
