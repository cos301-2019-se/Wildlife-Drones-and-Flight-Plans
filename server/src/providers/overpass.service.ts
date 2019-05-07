import { Injectable } from '@nestjs/common';

import axios from 'axios';
import * as xmldom from 'xmldom';
import * as osmToGeoJson from 'osmtogeojson';

@Injectable()
export class OverpassService {
  public async query(query: string) {
    query = query.replace(/\r\n/, '');

    const url = `http://overpass-api.de/api/interpreter?data=${encodeURI(query)}`;

    console.log('downloading map', url);

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    console.log('got axios');

    const parser = new xmldom.DOMParser();
    const dom = parser.parseFromString(res.data.toString());
    return osmToGeoJson(dom);
  }

  /**
   * Sanitise a query value so that user input may be sent to the api
   * @param queryValue
   */
  public sanitise(queryValue: string) {
    return queryValue.replace(/[\[\]\(\)\"\']/, '');
  }
}