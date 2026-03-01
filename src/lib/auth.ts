import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
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
  plugins: [tanstackStartCookies()]
})
