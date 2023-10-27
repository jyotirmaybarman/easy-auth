import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
  .createTable('users')
  .ifNotExists()
  .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
  .addColumn('first_name', 'varchar', (col) => col.notNull())
  .addColumn('middle_name', 'varchar')
  .addColumn('last_name', 'varchar', (col) => col.notNull())
  .addColumn('password', 'varchar', (col) => col.notNull())
  .addColumn('reset_token', 'varchar')
  .addColumn('verified', 'boolean', col => col.defaultTo(false))
  .addColumn('verification_token', 'varchar')
  .addColumn('email', 'varchar', (col) => col.unique().notNull())
  .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull() )
  .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull() )
  .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute()
}