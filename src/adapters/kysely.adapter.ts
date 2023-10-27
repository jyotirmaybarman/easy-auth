import { getDatabaseConnection } from "../database";
import { DatabaseClient } from "../interfaces/database-client.interface";
import { UserType } from "../types/user.type";
import { Database } from "../database/schema";
import { InsertObject, UpdateObject } from "kysely";
import { migrateToLatest } from "../database/migrator";
import { InitConfigType } from "../types/init-config.type";

export class KyselyAdapter implements DatabaseClient {
  private db;
  constructor(data: InitConfigType) {
    this.db = getDatabaseConnection(data.options);
    if (data.migrate) migrateToLatest(this.db, data.options.client);
  }

  async createUser(data: InsertObject<Database, "users">): Promise<UserType> {
    const user = await this.db
      .insertInto("users")
      .values(data)
      .returningAll()
      .execute();

    return user[0] as UserType;
  }

  async findUser(filter: UserType, select?: (keyof UserType)[]): Promise<UserType | null> {
    let query = this.db.selectFrom("users");
    select?.length
      ? select.forEach((str) => (query = query.select(str)))
      : (query = query.selectAll());
    query = this.updateQuery(filter, query);

    const user = await query.executeTakeFirst();

    return user as UserType;
  }

  async deleteUser(filter: UserType): Promise<UserType> {
    let query = this.db.deleteFrom("users");
    query = this.updateQuery(filter, query);
    const user = await query.returningAll().execute();
    return user[0] as UserType;
  }

  async updateUser(
    filter: UserType,
    data: UpdateObject<Database, "users">
  ): Promise<any | null> {
    let query = this.db.updateTable("users");

    query = this.updateQuery(filter, query);

    const user = await query.set(data).returningAll().execute();
    return user[0] as UserType;
  }

  private updateQuery(filter: UserType, query: any) {
    Object.keys(filter).forEach( key => {
      query = query.where(key, '=', filter[key as keyof UserType]);
    })
    return query;
  }
}
