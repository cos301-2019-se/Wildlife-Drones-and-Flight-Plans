import { Injectable } from '@nestjs/common';
import { GeoService, GeoSearchSet } from './geo.service';
import center from '@turf/center';

@Injectable()
export class MapPartitionerService {
  constructor(
    private geo: GeoService,
  ) {}
  /**
   * Returns a grid representation of the map.
   *
   * @param area The area being partitioned
   * @param mapFeatures Key-value list of features we want to get distances to
   * @param cellSizeKm How large cells should be (side length in km)
   */
  public partitionMap(area, mapFeatures, cellSizeKm: number = 1) {
    // tslint:disable-next-line:no-console
    console.log('partitioning map');
    // tslint:disable-next-line:no-console
    console.time('calculate grid');
    const grid = this.geo.partitionIntoGrid(area, cellSizeKm);
    // tslint:disable-next-line:no-console
    console.log('calculated grid', grid.length);
    // tslint:disable-next-line:no-console
    console.timeEnd('calculate grid');

    // calculate distances for each cell

    // construct search dataSets
    const searchDataSets: {[featureType: string]: GeoSearchSet} = Object.keys(mapFeatures)
      .reduce((ob, featureType) => {
        // tslint:disable-next-line:no-console
        console.time('build kd');
        // tslint:disable-next-line:no-console
        console.log(featureType);
        ob[featureType] = this.geo.createFastSearchDataset(mapFeatures[featureType]);
        // tslint:disable-next-line:no-console
        console.timeEnd('build kd');
        return ob;
      }, {});

    // get distances for each cell
    // tslint:disable-next-line:no-console
    console.time('distances');
    grid.forEach(cell => {
      // console.time('cellDistance');
      const cellCenter = center(cell);
      cell.properties.distances = {};

      Object.keys(mapFeatures).forEach(featureType => {
        const featureList = mapFeatures[featureType];

        const nearest = searchDataSets[featureType].getNearest(
          cellCenter.geometry.coordinates[0],
          cellCenter.geometry.coordinates[1],
        );
        cell.properties.distances[featureType] = nearest.distance;
      });
    });
    // tslint:disable-next-line:no-console
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
  };
}
