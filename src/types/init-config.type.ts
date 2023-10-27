import { DatabaseConfigType } from "./database-config.type";

export type InitConfigType = { options: DatabaseConfigType; migrate?: boolean, refresh?:boolean };
