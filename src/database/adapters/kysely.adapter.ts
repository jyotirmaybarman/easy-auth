import { getDatabaseConnection } from "..";
import { DatabaseClient } from "../../interfaces/database-client.interface";
import { UserType } from "../../types/user.type";
import { InitConfigType } from "../../types/init-config.type";
import { CreateUserType } from "../../types/create-user.type";

export class KyselyAdapter implements DatabaseClient {
  private db;
  constructor(data: InitConfigType) {
    this.db = getDatabaseConnection(data);
  }

  async createUser(data: CreateUserType): Promise<UserType> {
    const user = await this.db
      .insertInto("users")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
    return user as UserType;
  }

  async findUser(filter: Partial<UserType>, select?: (keyof UserType)[]): Promise<UserType | undefined> {
    let query = this.db.selectFrom("users");
    select?.length ? select.forEach((str) => (query = query.select(str))) : (query = query.selectAll());
    query = this.updateQuery(filter, query);
    const user = await query.executeTakeFirst();
    return user as UserType;
  }

  async deleteUser(filter: Partial<UserType>): Promise<UserType> {
    let query = this.db.deleteFrom("users");
    query = this.updateQuery(filter, query);
    const user = await query.returningAll().executeTakeFirstOrThrow();
    return user as UserType;
  }

  async updateUser(filter: Partial<UserType>, data: Partial<Omit<UserType, "created_at" | "updated_at">>): Promise<UserType> {
    let query = this.db.updateTable("users");
    query = this.updateQuery(filter, query);
    const user = await query.set(data).returningAll().executeTakeFirstOrThrow();
    return user as UserType;
  }

  private updateQuery(filter: Partial<UserType>, query: any) {
    Object.keys(filter).forEach(
      (key) => (query = query.where(key, "=", filter[key as keyof UserType]))
    );
    return query;
  }
}