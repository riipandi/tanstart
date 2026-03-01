import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const dialect = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/database'
})

export const auth = betterAuth({
  database: { dialect, type: 'postgresql' },
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
})
