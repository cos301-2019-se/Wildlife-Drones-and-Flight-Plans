import { Injectable } from '@nestjs/common';
import pointInPolygon from '@turf/boolean-point-in-polygon';
import overlaps from '@turf/boolean-overlap';
import within from '@turf/boolean-within';
import lineToPolygon from '@turf/line-to-polygon'
import * as geojsonExtent from '@mapbox/geojson-extent';
import getDistance from '@turf/distance';
import pointToLineDistance from '@turf/point-to-line-distance';
import { lengthToDegrees, point } from '@turf/helpers';
import { kdTree } from '../libraries/kd-tree';
import flatten from '@turf/flatten';
import simplify from '@turf/simplify';
import squareGrid from '@turf/square-grid';

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
  public getDistance(a, b) {
    return getDistance(a, b);
  }

  /**
   * Convert a number in km to degrees
   * @param distanceInKm 
   */
  public distanceToDegrees(distanceInKm) {
    return lengthToDegrees(distanceInKm, 'kilometers');
  }

  /**
   * Determine whether a GeoJSON feature a falls within GeoJSON polygon b.
   * The requirements for being within a polygon is that any of the points
   * of a must be within b.
   * 
   * @param {*} a A GeoJSON feature (may be a point, line, multiline, polygon, multipolygon)
   * @param {*} b A GeoJSON polygon or multipolygon
   */
  public isInPolygon(a, b) {
    if (a.geometry.type === 'Point') {
      return pointInPolygon(a, b);
    }

    if (a.geometry.type === 'LineString' || a.geometry.type === 'MultiLineString') {
      a = lineToPolygon(a);
    }

    return overlaps(a, b) || within(a, b) || within(b, a);
  }

  /**
   * Returns whether two bounding boxes overlap
   * @param a [left, bottom, right, top]
   * @param b [left, bottom, right, top]
   */
  public bboxesOverlap(a, b) {
    return !(b[0] > a[2]
      || b[2] < a[0]
      || b[3] < a[1]
      || b[1] > a[3]);
  }

  public createFastSearchDataset(features) {
    return new GeoSearchSet(features);
  }

  /**
   * Simplifies a GeoJSON geometry by removing points to a given tolerance.
   * Returns a new GeoJSON object - does not modify input object.
   * @param polygon The polygon to simplify
   * @param tolerance Lower = more detail
   */
  public simplifyGeometry(polygon, tolerance = 0.01) {
    return simplify(JSON.parse(JSON.stringify(polygon)), {
      mutate: true,
      tolerance,
      highQuality: false,
    });
  }

  /**
   * Partitions a polygon into square cells of given size. The cells
   * can overlap the boundary of the polygon.
   * @param polygon The polygon to partition
   * @param cellSizeKm The length of a cell's edge in kilometres
   */
  public partitionIntoGrid(polygon, cellSizeKm) {
    const simplifiedPolygon = this.simplifyGeometry(polygon);
    const bounds = this.getBoundingBox(polygon);
    return squareGrid(bounds, cellSizeKm, {
      units: 'kilometers',
    }).features
      .filter(feature => this.isInPolygon(feature, simplifiedPolygon));
  }
}

export class GeoSearchSet {
  private kd;
  constructor(features) {
    this.kd = new kdTree(
      features.reduce((points, feature) => {
        const featurePoints = flatten(feature).features[0].geometry.coordinates
          .map(point => {
            return {
              x: point[0],
              y: point[1],
            };
          });

        points.push(...featurePoints);
        return points;
      }, []),
      (a, b) => Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)),
      ['x', 'y'],
    );
  }

  public getNearest(x: number, y: number) {
    const nearest = this.kd.nearest({
      x,
      y,
    }, 1);

    return {
      point: nearest[0][0],
      distance: nearest[0][1],
    };
  }
}
