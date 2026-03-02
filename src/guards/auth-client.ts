import { createAuthClient } from 'better-auth/react'
import { publicEnv } from '#/config'

export const authClient = createAuthClient({
  baseURL: publicEnv.PUBLIC_BASE_URL
})

export type Session = typeof authClient.$Infer.Session
