import { passkey } from '@better-auth/passkey'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { betterAuth } from 'better-auth'
import {
  admin,
  apiKey,
  emailOTP,
  genericOAuth,
  magicLink,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from 'better-auth/plugins'
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
    magicLink({
      sendMagicLink: async (data, ctx) => {
        consola.log('sendMagicLink', data, ctx)
      },
    }),
    emailOTP({
      async sendVerificationOTP(data) {
        // if (data.type === 'sign-in') {
        //   // Send the OTP for sign in
        // } else if (data.type === 'email-verification') {
        //   // Send the OTP for email verification
        // } else {
        //   // Send the OTP for password reset
        // }
        consola.log('sendVerificationOTP', data)
      },
    }),
    phoneNumber({
      sendOTP: (data, ctx) => {
        consola.log('sendOTP', data, ctx)
      },
    }),
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
    passkey(),
    apiKey(),

    // Authorization plugins
    admin({ adminRoles: ['admin'], defaultRole: 'user' }),
    organization(),

    // Add TanStack Start Cookies plugin
    tanstackStartCookies(/* make sure this is the last plugin in the array */),
  ],
  experimental: {
    joins: true,
  },
})
