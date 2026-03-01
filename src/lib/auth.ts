/**
 * Better Auth configuration.
 *
 * @see: https://better-auth.com/docs/concepts/database#programmatic-migrations
 * @see: https://better-auth.com/docs/concepts/database#extending-core-schema
 */

import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { typeid } from 'typeid-js'
import { passwordHash, passwordVerify } from '#/lib/crypto'
import pkg from '~/package.json' with { type: 'json' }
import { db } from './db'

const isProduction = process.env.NODE_ENV === 'production'

export const auth = betterAuth({
  database: {
    db,
    type: 'postgres',
    transaction: true,
    debugLogs: false,
    casing: 'snake'
  },
  baseURL: process.env.APP_BASE_URL!,
  secret: process.env.AUTH_SECRET!,
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
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    },
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
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
    window: 10, // time window in seconds
    max: 100, // max requests in the window
    customRules: {
      '/get-session': false,
      '/sign-in/email': { window: 10, max: 3 }
    }
  },
  advanced: {
    cookiePrefix: pkg.name,
    useSecureCookies: isProduction,
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: process.env.APP_DOMAIN
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
