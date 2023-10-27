import { Database } from "./schema";
import mysql2 from "mysql2";
import pg from "pg";
import { Kysely, PostgresDialect, MysqlDialect } from "kysely";
import { DatabaseConfigType } from "../types/database-config.type";

export function getDatabaseConnection(
  config: DatabaseConfigType
): Kysely<Database> {
  let dialect;
  if (config.client == "mysql") {
    dialect = new MysqlDialect({
      pool: mysql2.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      }),
    });
  } else {
    dialect = new PostgresDialect({
      pool: new pg.Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      }),
    });
  }

  const db = new Kysely<Database>({
    dialect,
  });

  return db;
}
