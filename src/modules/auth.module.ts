import { DatabaseAdapter } from "../database/adapters";
import { InstanceConfigType } from "../types/instance-config.type";
import { CreateUserType } from "../types/create-user.type";

export class Auth {
  private adaptor;
  constructor(data: InstanceConfigType) {
    this.adaptor = new DatabaseAdapter(data.db);
  }

  async register(data: CreateUserType) {
    console.log("In register method");
    const user = await this.adaptor.findUser({
      first_name: data.first_name,
    });
    return user;
  }
}
