import { Injectable } from '@nestjs/common';
import * as pointInPolygon from 'point-in-polygon';
import * as geojsonExtent from '@mapbox/geojson-extent';
import { getDistance } from 'geolib';
import pointToLineDistance from '@turf/point-to-line-distance';
import { lengthToDegrees } from '@turf/helpers';

/**
 * Provides helped functions for geometry calculation
 */
@Injectable()
export class GeoService {
  /**
   * Returns all GeoJSON features within a given 
   * @param features GeoJSON 
   * @param area GeoJSON 
   */
  public findFeaturesInArea(features: any[], area) {
    return features.filter(feature => this.isInPolygon(feature.geometry.coordinates, area.geometry.coordinates))
  }

  /**
   * Returns the bounding box of a GeoJSON object.
   * @param geoJSON GeoJSON object
   * @returns [West, South, East, North] or [left, bottom, right, top]
   */
  public getBoundingBox(geoJSON) {
    return geojsonExtent(geoJSON);
  }

  /**
   * Returns the distance between a polgyon and a point
   * @param point
   * @param poly
   */
  public getDistanceToPoly(point: {lat: number; lng: number}, poly) {
    return pointToLineDistance([point.lat, point.lng], poly);
  }

  /**
   * Get the distance between two points
   * @param a source point
   * @param b destination point
   */
  public getDistance(a: {lat: number, lng: number}, b: {lat: number, lng: number}) {
    return getDistance({
      latitude: a.lat,
      longitude: a.lng,
    }, {
      latitude: b.lat,
      longitude: b.lng,
    });
  }

  /**
   * Convert a number in km to degrees
   * @param distanceInKm 
   */
  public distanceToDegrees(distanceInKm) {
    return lengthToDegrees(distanceInKm, 'kilometers');
  }

  /**
   * Determine whether a polygon (list of points) a falls within polygon b.
   * The requirements for being within a polygon is that any of the points
   * of a must be within b.
   * 
   * @param {*} a 
   * @param {*} b 
   */
  public isInPolygon(a, b) {
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