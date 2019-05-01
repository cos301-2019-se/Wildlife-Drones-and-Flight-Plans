import { Injectable } from '@nestjs/common';

import axios from 'axios';
import * as xmldom from 'xmldom';
import * as osmToGeoJson from 'osmtogeojson';
import * as pointInPolygon from 'point-in-polygon';

@Injectable()
export class MapUpdaterService {

  async updateMap(left: number, bottom: number, right: number, top:number) {
    const mapData = await this.downloadMap(left, bottom, right, top);

    const reserves = mapData.features
      .filter(feature => feature.properties.leisure && feature.properties.leisure === 'nature_reserve');
  
    const dams = mapData.features
      .filter(feature =>
        feature.properties.waterway &&
        feature.properties.waterway === 'dam' ||
        feature.properties.natural &&
        feature.properties.natural === 'water' ||
        feature.properties.water
      );

    const roads = mapData.features
      .filter(feature => 
        // feature.properties.type && feature.properties.type === 'route' ||
        feature.properties.route && feature.properties.route === 'road' ||
        feature.properties.highway
      );

    const reserve = reserves[0];

    const allFeatures = {
      reserve,
      dams: this.findFeaturesInArea(dams, reserve),
      roads: this.findFeaturesInArea(roads, reserve),
    };

    console.log(allFeatures);
    return allFeatures;
  }

  private findFeaturesInArea(features, reserve) {
    return features.filter(feature => this.isInPolygon(feature.geometry.coordinates, reserve.geometry.coordinates))
  }

  private async downloadMap(left: number, bottom: number, right: number, top:number) {
    const url = `http://api.openstreetmap.org/api/0.6/map?bbox=${left},${bottom},${right},${top}`;

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const parser = new xmldom.DOMParser();
    const dom = parser.parseFromString(res.data.toString());
    return osmToGeoJson(dom);
  }

  /**
   * Determine whether a polygon (list of points) a falls within polygon b.
   * The requirements for being within a polygon is that any of the points
   * of a must be within b.
   * 
   * @param {*} a 
   * @param {*} b 
   */
  private isInPolygon(a, b) {
    a = JSON.parse(JSON.stringify(a));
    b = JSON.parse(JSON.stringify(b));
    // if a is a line
    if (Array.isArray(a[0]) && typeof a[0][0] === 'number') {
      a = [a];
    }
    // if a is a single point
    if (typeof a[0] === 'number') {
      a = [a];
    }

    // convert multi polygon b so there are no instances of double bracketing
    for (const [i, el] of b.entries()) {
      if (Array.isArray(el) && el.length == 1) {
        b[i] = el[0];
      }
    }

    return b.some(bPoints => a.some(aPoints => aPoints.some(a => pointInPolygon(a, bPoints))));
  }

}