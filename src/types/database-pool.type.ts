import { MysqlPool, PostgresPool } from 'kysely';

export type MysqlPoolType = MysqlPool | (() => Promise<MysqlPool>)
export type PostgresPoolType = PostgresPool | (() => Promise<PostgresPool>)