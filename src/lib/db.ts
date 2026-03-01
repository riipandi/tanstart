import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'
import { Pool } from 'pg'

export const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      idleTimeoutMillis: 20000,
      max: 10
    })
  }),
  plugins: [new CamelCasePlugin()]
})
