import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { protectedEnv } from '#/config'

export const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: protectedEnv.DATABASE_URL,
      idleTimeoutMillis: 20000,
      max: 10
    })
  }),
  plugins: [new CamelCasePlugin()]
})
