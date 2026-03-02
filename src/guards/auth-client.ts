import { customSessionClient } from 'better-auth/client/plugins'
import { emailOTPClient } from 'better-auth/client/plugins'
import { twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { publicEnv } from '#/config'
import { getSafeRedirect } from '#/utils/redirect'

export const authClient = createAuthClient({
  baseURL: publicEnv.PUBLIC_BASE_URL,
  plugins: [
    customSessionClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        const currentUrl = new URL(window.location.href)
        const redirectParam = currentUrl.searchParams.get('redirect')
        const safeRedirect = getSafeRedirect(redirectParam)

        const twoFactorUrl = new URL('/two-factor', window.location.origin)
        if (safeRedirect && safeRedirect !== '/dashboard') {
          twoFactorUrl.searchParams.set('redirect', safeRedirect)
        }

        window.location.href = twoFactorUrl.toString()
      }
    }),
    emailOTPClient()
  ]
})

export type Session = typeof authClient.$Infer.Session
