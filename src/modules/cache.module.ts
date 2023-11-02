import { Milliseconds, Store, WrapTTL, caching } from "cache-manager";
import { InitConfigType } from "../types/init-config.type";

export type SomethingExtendingStoreType<S extends Store = Store> = {
    set: (key: string, value: unknown, ttl?: Milliseconds) => Promise<void>;
    get: <T>(key: string) => Promise<T | undefined>;
    del: (key: string) => Promise<void>;
    reset: () => Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, ttl?: WrapTTL<T>): Promise<T>;
    store: S;
};

export class Cache {
    public static adapter: SomethingExtendingStoreType
    public static initialized = false
    constructor(data: InitConfigType){
        Cache.init(data)
    }

    private static async init(data: InitConfigType){
        if(data.cache == "memory"){
            Cache.adapter = await caching("memory");
        }else{
            const store = await data.cache()
            Cache.adapter = await caching(store)
        }
        let key = String(new Date().getTime()) + "test";
        await Cache.adapter.set(key, "test")
        const rs = await Cache.adapter.get(key)
        if(rs){
            Cache.initialized = true
            console.log("Easy-Auth: Cache initialized");
            Cache.adapter.del(key);
        }
        else console.log("Easy-Auth: Cache not initialized");
    }
}