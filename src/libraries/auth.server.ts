import { DatabaseSync } from 'node:sqlite'
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: new DatabaseSync('database.sqlite'),
  emailAndPassword: {
    enabled: true,
  },
  experimental: { joins: true },
})
