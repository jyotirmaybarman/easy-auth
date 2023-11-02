import { DatabaseAdapterInterface } from "../interfaces/database-adapter.interface";

export type InstanceConfigType = {
  adapter: DatabaseAdapterInterface;
  jwt: {
    email_verification_secret: string;
    password_reset_secret: string;
    refresh_token_secret: string;
    access_token_secret: string;
  }
};