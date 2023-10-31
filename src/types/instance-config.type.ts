import { DatabaseAdapterInterface } from "../interfaces/database-adapter.interface";
import { InitConfigType } from "./init-config.type";

export type InstanceConfigType = Omit<InitConfigType, "database"> & {
  adapter: DatabaseAdapterInterface;
};
