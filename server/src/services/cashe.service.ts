import { Injectable, RequestTimeoutException } from '@nestjs/common';
//import { NodeCache } from 'node-cache';
const NodeCache = require( "node-cache" );

@Injectable()
export class CacheService {   
    private cache;

    constructor(
        //private readonly key: string,
       // private readonly nodeCashe: NodeCache
        ) {
        this.cache = new NodeCache({ stdTTL: 60*60/*ttl in seconds this is an hour*/ 
            , checkperiod:  60*60 * 0.2, useClones: false });
        //    this.cache.set(key,)
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
            return Promise.resolve(value);
        }

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

    // public async delStartWith(startStr = '') {
    //     if (!startStr) {
    //         return;
    //     }

    //     const keys = this.cache.keys();
    //     for (const key of keys) {
    //         if (key.indexOf(startStr) === 0) {
    //             this.deleteKey(key);
    //         }
    //     }
    // }

    /**
     * Delete all keys, and flush the cache.
     */
    public async flush() {
        this.cache.flushAll();
    }
}


//export default Cache;