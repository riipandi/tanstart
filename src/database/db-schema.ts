import type { Kysely } from 'kysely'

export interface AppDatabase {}

// Export Kysely with generic constrained to your Database
export type DBContext<T extends AppDatabase = AppDatabase> = Kysely<T>
