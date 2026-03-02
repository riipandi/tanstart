import { createFileRoute } from '@tanstack/react-router'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { trpcRouter } from '#/trpc/router'

function createContext(opts: FetchCreateContextFnOptions) {
  return {
    headers: opts.req.headers
  }
}

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
    createContext
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler
    }
  }
})
