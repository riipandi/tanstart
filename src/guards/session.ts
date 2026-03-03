import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/guards/auth'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  return await auth.api.getSession({
    headers: getRequestHeaders()
  })
})

export const ensureSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
})
