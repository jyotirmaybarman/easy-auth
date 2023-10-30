import { MysqlPoolType, PostgresPoolType } from "./database-pool.type";

export type InitWithMysqlType = { client: "mysql", pool: MysqlPoolType ; migrate?: boolean, refresh?:boolean };
export type InitWithPostgresType = { client: "postgres", pool: PostgresPoolType ; migrate?: boolean, refresh?:boolean };

export type InitConfigType = { 
    database: InitWithMysqlType | InitWithPostgresType; 
    jwt: { 
        email_verification_secret: string;
        password_reset_secret: string;
        refresh_token_secret: string;
        access_token_secret: string;
    } 
}
