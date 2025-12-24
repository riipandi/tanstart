import { passkeyClient } from '@better-auth/passkey/client'
import {
  adminClient,
  apiKeyClient,
  emailOTPClient,
  genericOAuthClient,
  magicLinkClient,
  oneTimeTokenClient,
  organizationClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: import.meta.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    usernameClient(),
    magicLinkClient(),
    emailOTPClient(),
    phoneNumberClient(),
    twoFactorClient(),
    genericOAuthClient(),
    passkeyClient(),

    // Authorization plugins
    apiKeyClient(),
    adminClient(),
    organizationClient(),

    // Utility plugins
    oneTimeTokenClient(),
  ],
})
