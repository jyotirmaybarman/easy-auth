import { Database } from "./schema";
import { Kysely, PostgresDialect, MysqlDialect } from "kysely";
import { MysqlPoolType, PostgresPoolType } from '../types/database-pool.type';
import { InitWithMysqlType, InitWithPostgresType } from "../types/init-config.type";
import { migrateToLatest } from "./migrator";

export function getDatabaseConnection(data: InitWithMysqlType | InitWithPostgresType): Kysely<Database> {
  let dialect;
  if (data.client == "mysql") {
    dialect = new MysqlDialect({ pool: data.pool as MysqlPoolType });
  } else if(data.client == "postgres") {
    dialect = new PostgresDialect({ pool: data.pool as PostgresPoolType });
  }

  if(!dialect) {
    throw new Error(`Invalid database client${data.client ? ':' : ''} "${data.client}"`);
  }

  const db = new Kysely<Database>({
    dialect,
  });

  if(data.migrate) migrateToLatest(db, data.client)
  
  db.introspection.getTables({ withInternalKyselyTables: true }).then(tables => {    
    console.log("Easy-Auth: Module initialized successfully");
    if(tables[0]?.name != 'kysely_migration' && !data.migrate) {
      console.log("NOTE: if you need migrations, just pass `migrate: true` while configuration");
    }
  }).catch(error => {
    console.log(error);
  })

  return db;
}
