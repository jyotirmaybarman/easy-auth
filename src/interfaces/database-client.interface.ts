import { InsertObject, UpdateObject } from "kysely";
import { UserType } from "../types/user.type";
import { Database } from "../database/schema";

export interface DatabaseClient {
  createUser(data: InsertObject<Database, "users">): Promise<UserType | undefined>;
  updateUser(
    filter: UserType,
    data: UpdateObject<Database, "users">
  ): Promise<UserType | undefined>;
  deleteUser(filter: UserType): Promise<UserType | undefined>;
  findUser(filter: UserType, select?: (keyof UserType)[]): Promise<UserType | undefined>;
}
