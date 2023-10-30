import { getDatabaseConnection } from "./database";
import { Auth } from "./modules/auth.module";
import { Middleware } from "./modules/middleware.module";
import { Validation } from './modules/validation.module';
import { InitConfigType } from './types/init-config.type';


export function init (config: InitConfigType){
  const db = getDatabaseConnection(config.database);
  return {
    Auth: new Auth({ db, jwt: config.jwt }),
    Validation: new Validation({ db, jwt: config.jwt }),
    Middleware: new Middleware({ db, jwt: config.jwt })
  }
}