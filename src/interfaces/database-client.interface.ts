import { InsertObject, UpdateObject } from "kysely";
import { UserType } from "../types/user.type";
import { Database } from "../database/schema";

export interface DatabaseClient {
  createUser(data: InsertObject<Database, "users">): Promise<UserType>;
  updateUser(
    filter: UserType,
    data: UpdateObject<Database, "users">
  ): Promise<UserType | null>;
  deleteUser(filter: UserType): Promise<UserType>;
  findUser(filter: UserType, select?: (keyof UserType)[]): Promise<UserType | null>;
}
