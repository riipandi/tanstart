import { passkeyClient } from '@better-auth/passkey/client'
import { adminClient } from 'better-auth/client/plugins'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { magicLinkClient } from 'better-auth/client/plugins'
import { emailOTPClient, twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { publicEnv } from '#/config'
import { auth } from '#/guards/auth'
import { getSafeRedirect } from '#/utils/redirect'

export const authClient = createAuthClient({
  baseURL: publicEnv.PUBLIC_BASE_URL,
  plugins: [
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
    emailOTPClient(),
    magicLinkClient(),
    passkeyClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>()
  ]
})

export type Session = typeof authClient.$Infer.Session
