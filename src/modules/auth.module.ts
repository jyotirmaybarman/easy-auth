import { DatabaseAdapter } from "../database/adapters";
import { CreateUserType } from "../types/create-user.type";
import { InitConfigType } from "../types/init-config.type";

export class Auth {
  private adaptor;
  constructor(data: InitConfigType) {
    this.adaptor = new DatabaseAdapter(data);
  }

  async register(data: CreateUserType) {
    console.log("In register method");
    const user = await this.adaptor.findUser({
      first_name: data.first_name,
    });
    return user;
  }
}
