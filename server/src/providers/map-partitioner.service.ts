import { Injectable } from '@nestjs/common';
import { GeoService } from './geo.service';
import squareGrid from '@turf/square-grid';
import simplify from '@turf/simplify';
import center from '@turf/center';
import centerOfMass from '@turf/center-of-mass';
import polygonToLine from '@turf/polygon-to-line';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import overlaps from '@turf/boolean-overlap';
import { polygon } from '@turf/helpers';

@Injectable()
export class MapPartitionerService {
  constructor(
    private geo: GeoService,
  ) {}

  /**
   * Returns a grid representation of the map.
   * 
   * @param area 
   * @param features 
   * @param cellSize 
   */
  public partitionMap(area, features: { roads: any[]; water: any[]; }, cellSizeKm: number = 1, qtCellSizeKm = 24) {
    console.log('partitioning map');
    const bounds = this.geo.getBoundingBox(area);

    // create a cache of water features. Find bounding boxes and simplify geometry
    console.time('cache water features');
    const waterFeatures = features.water.map(feature => {
      const bbox = this.geo.getBoundingBox(feature);
      if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'Multipolygon') {
        feature.bbox = bbox;
        return feature;
      }

      const featureLine = polygonToLine(feature);
      const simplified = simplify(featureLine, {
        tolerance: 0.1,
      });
      simplified.bbox = bbox;
      return simplified;
    });
    console.timeEnd('cache water features');

    // simplify the area. Kruger would require over 240 million iterations at cellSizeKm = 0.5km
    console.time('simplify area');
    const simplifiedArea = simplify(JSON.parse(JSON.stringify(area)), {
      mutate: true,
      tolerance: 0.01,
      highQuality: false,
    });
    console.timeEnd('simplify area');

    console.time('large grid');
    // build a sort of quadtree to make finding distances significantly faster
    const quadTree: any = squareGrid(bounds, qtCellSizeKm, {
      units: 'kilometers',
      mask: simplifiedArea,
    }).features
      .map(cell => {
        console.time('large grid child features');
        const cellBbox = this.geo.getBoundingBox(cell);
        const childFeatures = waterFeatures.filter(feature => {
          return this.geo.bboxesOverlap(
            cellBbox,
            feature.bbox,
          );
        });
        console.timeEnd('large grid child features');
        return {
          ...cell,
          properties: {
            childFeatures,
          },
          bbox: cellBbox,
        };
      });
    console.timeEnd('large grid');

    console.log('qtLength', quadTree.length)

    // console.dir(quadTree, {
    //   depth: 3
    // });

    console.log('area len        ', area.geometry.coordinates[0].length);
    console.log('simple area len ', simplifiedArea.geometry.coordinates[0].length);
    console.log('got bounds');
    console.time('calculate grid');
    let notFound = 0;
    const grid = squareGrid(bounds, cellSizeKm, {
      units: 'kilometers',
      mask: simplifiedArea,
    }).features
      .reduce((cells, cell) => {
        const cellWithQt = {
          ...cell,
          properties: {
            ...cell.properties,
            quadtreeCell: quadTree.find(qtCell => {
              return this.geo.isInPolygon(cell, qtCell);
            }),
          },
        };

        if (!cellWithQt.properties.quadtreeCell) {
          return cells;
        }
        cells.push(cellWithQt);
        return cells;
      }, []);
    console.log('calculated grid', grid.length);
    console.timeEnd('calculate grid');

    console.time('distances');
    grid.forEach((cell, count) => {
      // console.time('cellDistance');
      cell.properties['distanceToWater'] = cell.properties.quadtreeCell.properties.childFeatures.reduce((smallest, feature) => {
        const cellCenter = center(cell);
        const nearestPoint = nearestPointOnLine(feature, cellCenter);
        const distance = nearestPoint.properties.dist;
        if (distance < smallest) {
          return distance;
        }
        return smallest;
      }, Infinity);
      // console.timeEnd('cellDistance');
      console.log(`${count + 1}/${grid.length} (${count / grid.length * 100}%)`);
    });
    console.timeEnd('distances');


    return grid;
  }
}

export interface Cell {
  lat: number;
  lng: number;
  distances: {
    water: number;
    vegetation: number;
    settlement: number;
    road: number;
  }
}