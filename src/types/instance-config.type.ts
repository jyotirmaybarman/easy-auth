import { DatabaseAdapterInterface } from "../interfaces/database-adapter.interface";

export type InstanceConfigType = {
  adapter: DatabaseAdapterInterface;
  jwt: {
    verification_secret: string;
    password_reset_secret: string;
    refresh_token_secret: string;
    access_token_secret: string;
  };
};
