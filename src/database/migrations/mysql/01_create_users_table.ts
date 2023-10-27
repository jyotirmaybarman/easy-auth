import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
  .createTable("users")
  .ifNotExists()
  .addColumn("id", sql`binary(16)`, (col) => col.primaryKey().defaultTo(sql`(uuid_to_bin(uuid(), 1))`))
  .addColumn('first_name', 'varchar(255)', (col) => col.notNull())
  .addColumn('middle_name', 'varchar(255)')
  .addColumn('last_name', 'varchar(255)', (col) => col.notNull())
  .addColumn('password', 'varchar(255)', (col) => col.notNull())
  .addColumn('reset_token', 'varchar(255)')
  .addColumn('verified', 'boolean', col => col.defaultTo(0))
  .addColumn('verification_token', 'varchar(255)')
  .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
  .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull() )
  .addColumn("updated_at", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull() )
  .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
