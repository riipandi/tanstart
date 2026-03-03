import { getMigrations } from 'better-auth/db/migration'
import { auth } from '#/guards/auth'
import type { DBContext } from '../db-schema'

export async function up(_db: DBContext): Promise<void> {
  const { toBeCreated, runMigrations } = await getMigrations(auth.options)

  if (toBeCreated.length > 0) {
    const tableNames = toBeCreated.map((item) => item.table).join(', ')
    console.info(`  - Migration Better Auth tables: ${tableNames}`)
  }

  await runMigrations().catch((error) => {
    console.error('runMigrations', error)
  })
}

export async function down(_db: DBContext): Promise<void> {}
