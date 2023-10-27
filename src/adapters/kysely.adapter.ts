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
    if (filter.email) query = query.where("email", "=", filter.email);
    if (filter.id) query = query.where("id", "=", filter.id);
    if (filter.first_name)
      query = query.where("first_name", "=", filter.first_name);
    if (filter.last_name)
      query = query.where("last_name", "=", filter.last_name);
    if (filter.middle_name)
      query = query.where("middle_name", "=", filter.middle_name);
    if (filter.verified) query = query.where("verified", "=", filter.verified);
    if (filter.verification_token)
      query = query.where("verification_token", "=", filter.verification_token);
    if (filter.reset_token)
      query = query.where("reset_token", "=", filter.reset_token);

    return query;
  }
}
