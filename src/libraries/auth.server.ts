import { LibsqlDialect } from '@libsql/kysely-libsql'
import { betterAuth } from 'better-auth'
import { genericOAuth } from 'better-auth/plugins'
import { consola } from 'consola'
import { env } from 'std-env'

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: 'file:database.db',
      // url: 'libsql://localhost:8080?tls=0',
      // syncUrl: process.env.TURSO_DATABASE_URL,
      // authToken: process.env.TURSO_AUTH_TOKEN,
      // syncInterval: 60000,
    }),
    casing: 'camel',
    transaction: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (ctx) => {
      consola.log('sendResetPassword', ctx)
    },
    onPasswordReset: async (ctx, request) => {
      consola.log('onPasswordReset', ctx, request)
    },
  },
  emailVerification: {
    sendVerificationEmail: async (ctx, request) => {
      consola.log('sendVerificationEmail', ctx, request)
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'provider-id',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          discoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
          scopes: [],
        },
      ],
    }),
  ],
  experimental: { joins: true },
})
