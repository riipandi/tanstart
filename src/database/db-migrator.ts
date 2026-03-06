import { sql, type MigrationProvider } from 'kysely'
import type { DBContext } from './db-schema'

/**
 * Default value for timestamp columns (UNIX timestamp).
 */
export const UNIX_TIMESTAMP = sql.raw("(strftime('%s','now'))")

interface AppMigration {
  up: (db: DBContext) => Promise<void>
  down: (db: DBContext) => Promise<void>
}

/**
 * Custom in-memory migration provider that doesn't rely on file imports.
 * This allows migrations to be bundled with the code and run in production
 * without filesystem access.
 */
class InMemoryMigrationProvider implements MigrationProvider {
  private migrations: Record<string, AppMigration>

  constructor(migrations: Record<string, AppMigration>) {
    this.migrations = migrations
  }

  async getMigrations(): Promise<Record<string, AppMigration>> {
    return this.migrations
  }
}

/**
 * Create an in-memory migration provider with all registered migrations.
 * Migrations are automatically discovered from the migrations folder using import.meta.glob
 * and bundled at build time.
 */
export function createMigrationProvider(): MigrationProvider {
  // Automatically import all .ts files in the migrations folder
  const migrationModules = import.meta.glob('./migrations/*.ts', { eager: true })

  /**
   * Extract migration name from file path.
   * Example: './migrations/0001_create_user_table.ts' -> '0001_create_user_table'
   */
  function getMigrationName(filePath: string): string {
    // Remove the './migrations/' prefix and the '.ts' extension
    return filePath
      .replace(/^\.\//, '')
      .replace(/^migrations\//, '')
      .replace(/\.ts$/, '')
  }

  /**
   * Build migrations object from all imported migration modules.
   * Each migration file must export `up` and `down` functions.
   */
  const migrations: Record<string, AppMigration> = {}

  for (const [filePath, module] of Object.entries(migrationModules)) {
    const migrationName = getMigrationName(filePath)
    const migrationModule = module as AppMigration

    // Validate that the migration module has the required exports
    if (!migrationModule.up || typeof migrationModule.up !== 'function') {
      throw new Error(`Migration "${migrationName}" is missing the "up" function export`)
    }

    if (!migrationModule.down || typeof migrationModule.down !== 'function') {
      throw new Error(`Migration "${migrationName}" is missing the "down" function export`)
    }

    migrations[migrationName] = {
      up: migrationModule.up,
      down: migrationModule.down
    }
  }

  return new InMemoryMigrationProvider(migrations)
}
