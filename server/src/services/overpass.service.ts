import { Injectable } from '@nestjs/common';

import axios from 'axios';
import * as xmldom from 'xmldom';
import * as osmToGeoJson from 'osmtogeojson';

import * as fs from 'fs-extra';
import * as sha256 from 'simple-sha256';

@Injectable()
export class OverpassService {
  public async query(query: string) {
    query = query.replace(/\r\n/, '');
    // tslint:disable-next-line:no-console
    console.log(query);

    const cachedQuery = await this.getCachedQuery(query);
    if (cachedQuery) {
      return cachedQuery;
    }

    let res;
    while (true) {
      const url = `http://overpass-api.de/api/interpreter?data=${encodeURI(
        query,
      )}`;
      // tslint:disable-next-line:no-console
      console.log('downloading map', url);
      try {
        res = await axios.get(url, {
          responseType: 'arraybuffer',
        });
      } catch (err) {
        if (err.response.status === 429) {
          // tslint:disable-next-line:no-console
          console.log('hit rate limit. Retrying');
          await new Promise(resolve => setTimeout(resolve, 15000));
          continue;
        }
        throw err;
      }
      break;
    }
    // tslint:disable-next-line:no-console
    console.log('got axios');

    const parser = new xmldom.DOMParser();
    const dom = parser.parseFromString(res.data.toString());
    const result = osmToGeoJson(dom);

    await this.cacheQuery(query, result);

    return result;
  }

  /**
   * Sanitise a query value so that user input may be sent to the api
   * @param queryValue
   */
  public sanitise(queryValue: string) {
    return queryValue.replace(/[\[\]()"']/, '');
  }

   /**
   * Returns the path to the cached query for faster access
   * @param query The cached information in question
   */
  private async getCachedQueryPath(query) {
    const queryHash = await sha256(query);
    return `.map-cache/${queryHash}`;
  }

  /**
   * Caches a query made, for faster access in the future
   * @param query The data/information that needs toi be cached
   * @param result Returns the path to the cacthed query
   */
  private async cacheQuery(query, result) {
    const cachePath = await this.getCachedQueryPath(query);
    fs.outputFileSync(cachePath, JSON.stringify(result));
  }

  /**
   * Returns the actual cached query for faster access
   * @param query The cached information in question
   */
  private async getCachedQuery(query) {
    const cachedPath = await this.getCachedQueryPath(query);
    if (fs.existsSync(cachedPath)) {
      return JSON.parse(fs.readFileSync(cachedPath).toString());
    }
    return null;
  }
}
