import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/libraries/auth.server'

export const authMiddleware = createMiddleware().server(async ({ next, pathname }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    // Use the current location to power a redirect after login
    // (Do not use `router.state.resolvedLocation` as it can
    // potentially lag behind the actual current location)
    throw redirect({
      href: `/auth/signin?redirect=${pathname}`,
      search: { redirect: pathname },
    })
  }

  return await next()
})
