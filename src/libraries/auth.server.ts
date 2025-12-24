import { LibsqlDialect } from '@libsql/kysely-libsql'
import { betterAuth } from 'better-auth'
import { genericOAuth, twoFactor, username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { consola } from 'consola'
import { env } from 'std-env'

export const auth = betterAuth({
  appName: 'TanStack Starter',
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
    requireEmailVerification: false,
    sendResetPassword: async (ctx) => {
      consola.log('sendResetPassword', ctx)
    },
    onPasswordReset: async (data, request) => {
      consola.log('onPasswordReset', data, request)
    },
  },
  emailVerification: {
    sendVerificationEmail: async (data, request) => {
      consola.log('sendVerificationEmail', data, request)
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    username(),
    twoFactor({
      otpOptions: {
        async sendOTP(data, ctx) {
          consola.log('sendOTP', data, ctx)
        },
      },
    }),
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
    tanstackStartCookies(/* make sure this is the last plugin in the array */),
  ],
  experimental: { joins: true },
})
