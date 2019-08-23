import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService {
    private cache;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 60 * 60,
            checkperiod: 60 * 60 * 2,
            useClones: false,
        });
    }

    /**
     * Get a value of specific key in the store. If key exists,
     *  return the cached value. Else, get a new value from the
     *  store function, and set a new value in the cache service.
     *  The store function promises the flexibility we need when we 
     * store the value.
     * @param key 
     * @param storeFunction 
     */
    public async getKey(key, storeFunction) {
        const value = this.cache.get(key);
        if (value) {
            console.log('cache hit', key);
            return Promise.resolve(value);
        }

        console.log('cache miss', key);

        return storeFunction().then((result) => {
            this.cache.set(key, result);
            return result;
        });
    }

    /**
     * Delete a key from the cache
     * @param keys 
     */
    public async deleteKey(keys) {
        this.cache.del(keys);
    }

    /**
     * Delete all keys, and flush the cache.
     */
    public async flush() {
        this.cache.flushAll();
    }
}
