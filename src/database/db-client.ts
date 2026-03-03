/**
 * Configures the Kysely database client with the appropriate dialect and plugins.
 *
 * The configuration includes the following plugins:
 * - `CamelCasePlugin`: Automatically converts column names to camelCase.
 * - `ParseJSONResultsPlugin`: Automatically parses JSON columns.
 *
 * @see https://www.kysely.dev/docs/dialects
 * @see https://github.com/kysely-org/kysely-postgres-js
 */

import { PostgresDialect } from 'kysely'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import { Pool } from 'pg'
import { protectedEnv } from '#/config'
import { prettyMs } from '#/utils/humanize'
import type { AppDatabase } from './db-schema'

export const kyselyConfig: Partial<KyselyConfig> = {
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    const logLevel = protectedEnv.APP_LOG_LEVEL
    const { queryId } = event.query.queryId

    if (event.level === 'query' && logLevel === 'trace') {
      console.debug('Executed SQL Query', queryId, {
        sql: event.query.sql,
        parameters: JSON.stringify(event.query.parameters),
        duration: prettyMs(event.queryDurationMillis)
      })
      return
    }
    if (event.level === 'error' && logLevel === 'debug') {
      console.error('Error SQL Query', queryId, event.error)
    }
  }
}

// Initialize Kysely instance for the migration
export const dbMigrator = new Kysely<AppDatabase>({
  ...kyselyConfig,
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: protectedEnv.DATABASE_URL,
      idleTimeoutMillis: 20000,
      max: 1
    })
  })
})

// Initialize Kysely instance for the application
export const dbClient = new Kysely<AppDatabase>({
  ...kyselyConfig,
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: protectedEnv.DATABASE_URL,
      idleTimeoutMillis: 20000,
      max: 10
    })
  })
})
