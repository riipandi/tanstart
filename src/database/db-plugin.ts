import { Migrator } from 'kysely'
import { definePlugin } from 'nitro'
import { protectedEnv } from '#/config'
import { dbMigrator } from './db-client'
import { createMigrationProvider } from './db-migrator'

export default definePlugin(async (_nitro) => {
  if (!protectedEnv.DATABASE_AUTO_MIGRATE) {
    console.info('Automatic migration disabled, skipping...')
    return
  }

  // Run database migration once during server startup
  console.info('Starting database migration...')

  // Use the in-memory migration provider instead of FileMigrationProvider.
  // This allows migrations to be bundled with the code and run in production
  // without filesystem access
  const migrationProvider = createMigrationProvider()
  const migrator = new Migrator({
    db: dbMigrator,
    provider: migrationProvider,
    migrationTableName: 'app_migration',
    migrationLockTableName: 'app_migration_lock'
  })

  console.info('Running migrations to latest version...')

  const { error, results } = await migrator.migrateToLatest()

  if (results && results.length > 0) {
    let executedCount = 0
    let skippedCount = 0

    results.forEach((it) => {
      if (it.status === 'Success') {
        console.info(`  - Migration "${it.migrationName}" executed successfully`)
        executedCount++
      } else if (it.status === 'Error') {
        console.error(`  - Failed to execute migration "${it.migrationName}"`)
      }
    })

    // Count skipped migrations (already executed)
    const filteredResult = results.filter(
      (it) => it.status === 'NotExecuted' || it.status === 'Success'
    )
    skippedCount = filteredResult.length - executedCount

    console.info('Migration summary:')
    console.info(`  - Executed: ${executedCount}`)
    console.info(`  - Already up to date: ${skippedCount}`)
  } else {
    console.info('No migrations to run (database is up to date)')
  }

  if (error) {
    console.error('Migration failed', error)
    process.exit(1)
  }

  console.info('Database migration completed successfully')
})
