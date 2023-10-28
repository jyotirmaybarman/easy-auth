import { MysqlPoolType, PostgresPoolType } from "./database-pool.type";

type InitWithMysqlType = { client: "mysql", pool: MysqlPoolType ; migrate?: boolean, refresh?:boolean };
type InitWithPostgresType = { client: "postgres", pool: PostgresPoolType ; migrate?: boolean, refresh?:boolean };

export type InitConfigType = InitWithMysqlType | InitWithPostgresType
