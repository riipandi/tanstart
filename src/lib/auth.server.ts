import { betterAuth } from 'better-auth'
import type { BetterAuthOptions } from 'better-auth/types'
import { Pool } from 'pg'

const dialect = new Pool({
  connectionString: String(process.env.DATABASE_URL)
})

const authOptions: BetterAuthOptions = {
  database: {
    dialect,
    type: 'postgresql',
    transaction: true,
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
  }
}

export const auth = betterAuth(authOptions)
