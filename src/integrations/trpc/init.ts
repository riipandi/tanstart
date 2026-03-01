import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { auth, type Session } from '#/lib/auth'

type Context = {
  headers: Headers
  session?: Session | null
}

const t = initTRPC.context<Context>().create({
  transformer: superjson
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure that requires authentication.
 * Throws UNAUTHORIZED if no valid session is found.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: ctx.headers })

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    })
  }

  return next({ ctx: { ...ctx, session } })
})
