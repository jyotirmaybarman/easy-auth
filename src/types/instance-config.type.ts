import { Kysely } from "kysely";
import { InitConfigType } from "./init-config.type";
import { Database } from "../database/schema";

export type InstanceConfigType = Omit<InitConfigType, "database"> & {
    db: Kysely<Database>
}