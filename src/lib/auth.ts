/**
 * Better Auth configuration.
 *
 * @see: https://better-auth.com/docs/concepts/database#programmatic-migrations
 * @see: https://better-auth.com/docs/concepts/database#extending-core-schema
 */

import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { typeid } from 'typeid-js'
import { protectedEnv } from '#/config'
import { passwordHash, passwordVerify } from '#/lib/crypto'
import { db } from './db'

export const auth = betterAuth({
  database: {
    db,
    type: 'postgres',
    transaction: true,
    debugLogs: false,
    casing: 'snake'
  },
  baseURL: protectedEnv.PUBLIC_BASE_URL,
  secret: protectedEnv.AUTH_SECRET_KEY,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: async (password) => await passwordHash(password, { algo: 'scrypt' }),
      verify: async ({ password, hash }) => await passwordVerify(password, hash)
    },
    sendResetPassword: async (ctx, request) => {
      console.info('sendResetPassword', { ctx, request })
    },
    onExistingUserSignUp: async (ctx, request) => {
      console.info('Sign-up attempt with existing email', { ctx, request })
    },
    onPasswordReset: async (ctx, request) => {
      console.info('onPasswordReset', { ctx, request })
    }
  },
  emailVerification: {
    expiresIn: 3600,
    sendOnSignUp: true,
    sendVerificationEmail: async (ctx, request) => {
      console.info('sendVerificationEmail', { ctx, request })
    }
  },
  socialProviders: {
    github: {
      clientId: protectedEnv.AUTH_GITHUB_CLIENT_ID,
      clientSecret: protectedEnv.AUTH_GITHUB_CLIENT_SECRET
    },
    google: {
      prompt: 'select_account',
      clientId: protectedEnv.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: protectedEnv.AUTH_GOOGLE_CLIENT_SECRET
    }
  },
  session: {
    storeSessionInDatabase: true,
    preserveSessionInDatabase: true,
    expiresIn: 86400 * 7, // 7 days
    updateAge: 86400 * 1 // 1 day (every 1 day the session expiration is updated)
  },
  account: {
    storeStateStrategy: 'database',
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
    accountLinking: { enabled: true, trustedProviders: ['google', 'github'] }
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async (ctx, request) => {
        console.info('sendChangeEmailConfirmation', { ctx, request })
      }
    },
    deleteUser: {
      enabled: false,
      sendDeleteAccountVerification: async (ctx, request) => {
        console.info('sendDeleteAccountVerification', { ctx, request })
      }
    }
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    max: protectedEnv.PUBLIC_RATE_LIMIT_DEFAULT_MAX, // max requests in the window
    window: protectedEnv.PUBLIC_RATE_LIMIT_DEFAULT_WINDOW, // time window in seconds
    customRules: {
      '/get-session': false,
      '/sign-in/email': { window: 10, max: 3 }
    }
  },
  advanced: {
    cookiePrefix: protectedEnv.PUBLIC_IDENTIFIER,
    useSecureCookies: protectedEnv.APP_MODE === 'production',
    crossSubDomainCookies: {
      enabled: protectedEnv.APP_MODE === 'production',
      domain: protectedEnv.PUBLIC_SITE_DOMAIN
    },
    database: {
      generateId: (opts) => {
        // Let database auto-generate for specific models
        if (opts.model === 'user') {
          return typeid('user').toString()
        }
        if (opts.model === 'account') {
          return typeid('acc').toString()
        }
        if (opts.model === 'session') {
          return typeid('sess').toString()
        }
        // Generate UUIDs for other tables
        return typeid().toUUID()
      }
    }
  },
  experimental: { joins: true },
  plugins: [tanstackStartCookies()]
})

export type Session = typeof auth.$Infer.Session
