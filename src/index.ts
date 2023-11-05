import { Auth } from "./modules/auth.module";
import { Cache } from "./modules/cache.module";
import { Middleware } from "./modules/middleware.module";
import { InitConfigType } from './types/init-config.type';


export function init (config: Omit<InitConfigType, "cache"> & Partial<Pick<InitConfigType, "cache">>){
  if(!config.cache) config.cache = "memory";
  const newConfig = config as InitConfigType;
  new Cache(newConfig)
  return {
    Auth: new Auth(newConfig),
    Middleware: new Middleware(newConfig)
  }
}