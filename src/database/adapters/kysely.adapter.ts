import { getDatabaseConnection } from "..";
import { DatabaseClient } from "../../interfaces/database-client.interface";
import { UserType } from "../../types/user.type";
import { Database } from "../schema";
import { InsertObject, UpdateObject } from "kysely";
import { InitConfigType } from "../../types/init-config.type";

export class KyselyAdapter implements DatabaseClient {
  private db;
  constructor(data: InitConfigType) {
    this.db = getDatabaseConnection(data);
  }

  async createUser(
    data: InsertObject<Database, "users">
  ): Promise<UserType | undefined> {
    const user = await this.db
      .insertInto("users")
      .values(data)
      .returningAll()
      .executeTakeFirst();
    return user;
  }

  async findUser(
    filter: UserType,
    select?: (keyof UserType)[]
  ): Promise<UserType | undefined> {
    let query = this.db.selectFrom("users");
    select?.length
      ? select.forEach((str) => (query = query.select(str)))
      : (query = query.selectAll());
    query = this.updateQuery(filter, query);
    const user = await query.executeTakeFirst();
    return user;
  }

  async deleteUser(filter: UserType): Promise<UserType | undefined> {
    let query = this.db.deleteFrom("users");
    query = this.updateQuery(filter, query);
    const user = await query.returningAll().executeTakeFirst();
    return user;
  }

  async updateUser(
    filter: UserType,
    data: UpdateObject<Database, "users">
  ): Promise<any | null> {
    let query = this.db.updateTable("users");
    query = this.updateQuery(filter, query);
    const user = await query.set(data).returningAll().executeTakeFirst();
    return user;
  }

  private updateQuery(filter: UserType, query: any) {
    Object.keys(filter).forEach(
      (key) => (query = query.where(key, "=", filter[key as keyof UserType]))
    );
    return query;
  }
}
