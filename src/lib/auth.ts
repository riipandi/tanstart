/**
 * Better Auth configuration.
 *
 * @see: https://better-auth.com/docs/concepts/database#programmatic-migrations
 * @see: https://better-auth.com/docs/concepts/database#extending-core-schema
 */

import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { typeid } from 'typeid-js'
import pkg from '~/package.json' with { type: 'json' }
import { db } from './db'

export const auth = betterAuth({
  database: {
    db,
    type: 'postgres',
    transaction: true,
    debugLogs: true,
    casing: 'snake'
  },
  baseURL: process.env.APP_BASE_URL!,
  emailAndPassword: { enabled: true },
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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  advanced: {
    cookiePrefix: pkg.name,
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === 'production',
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
  plugins: [tanstackStartCookies()]
})
