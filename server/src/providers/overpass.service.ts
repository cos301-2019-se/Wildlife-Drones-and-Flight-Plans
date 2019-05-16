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
    console.log(query);

    const cachedQuery = await this.getCachedQuery(query);
    if (cachedQuery) {
      return cachedQuery;
    }

    const url = `http://overpass-api.de/api/interpreter?data=${encodeURI(query)}`;

    console.log('downloading map', url);

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
    });

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
    return queryValue.replace(/[\[\]\(\)\"\']/, '');
  }

  private async getCachedQueryPath(query) {
    const queryHash = await sha256(query);
    return `.map-cache/${queryHash}`;
  }

  private async cacheQuery(query, result) {
    const cachePath = await this.getCachedQueryPath(query);
    fs.outputFileSync(cachePath, JSON.stringify(result));
  }

  private async getCachedQuery(query) {
    const cachedPath = await this.getCachedQueryPath(query);
    if (fs.existsSync(cachedPath)) {
      return JSON.parse(fs.readFileSync(cachedPath).toString());
    }
    return null;
  }
}