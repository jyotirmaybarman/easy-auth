import { Auth } from "./modules/auth.module";
import { Middleware } from "./modules/middleware.module";
import { Validation } from './modules/validation.module';
import { InitConfigType } from './types/init-config.type';


export function init (config: InitConfigType){
  return {
    Auth: new Auth(config),
    Validation: new Validation(config),
    Middleware: new Middleware(config)
  }
}