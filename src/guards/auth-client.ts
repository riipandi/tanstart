import { emailOTPClient } from 'better-auth/client/plugins'
import { twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { publicEnv } from '#/config'

export const authClient = createAuthClient({
  baseURL: publicEnv.PUBLIC_BASE_URL,
  plugins: [twoFactorClient(), emailOTPClient()]
})

export type Session = typeof authClient.$Infer.Session
