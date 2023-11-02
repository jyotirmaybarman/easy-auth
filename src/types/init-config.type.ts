import { Store } from "cache-manager";
import { DatabaseAdapterInterface } from "../interfaces/database-adapter.interface";

export type InitConfigType = {
  adapter: DatabaseAdapterInterface;
  jwt: {
    email_verification_secret: string;
    password_reset_secret: string;
    refresh_token_secret: string;
    access_token_secret: string;
  };
  cache: (() => Promise<Store>) | "memory"
};