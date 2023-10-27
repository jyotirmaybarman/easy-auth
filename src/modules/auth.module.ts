import { DatabaseAdapter } from "../adapters";
import { CreateUserType } from "../types/create-user.type";
import { InitConfigType } from "../types/init-config.type";

export class Auth{
    private adaptor;
    constructor(data: InitConfigType) {
        this.adaptor = new DatabaseAdapter(data);
    }

    async register(data: CreateUserType) {
        console.log("In register method");
        console.log(data);
        return data;
    }
}