import { Injectable } from '@nestjs/common';
import { GeoService, GeoSearchSet } from './geo.service';
import squareGrid from '@turf/square-grid';
import simplify from '@turf/simplify';
import center from '@turf/center';
import bbox from '@turf/bbox';
import { SRTMService } from './srtm.service';

@Injectable()
export class MapPartitionerService {
  constructor(
    private geoService: GeoService,
    private altitudeService: SRTMService,
  ) {}

  /**
   * Returns a grid representation of the map.
   * 
   * @param area The area being partitioned
   * @param mapFeatures Key-value list of features we want to get distances to
   * @param cellSize How large cells should be (side length in km)
   */
  public async partitionMap(area, mapFeatures, cellSizeKm: number = 1) {
    const areaBounds = bbox(area);

    console.log('partitioning map');
    console.time('calculate grid');
    const grid = this.geoService.partitionIntoGrid(area, cellSizeKm);
    console.log('calculated grid', grid.length);
    console.timeEnd('calculate grid');

    // calculate distances for each cell

    // construct search datasets
    const searchDatasets: {[featureType: string]: GeoSearchSet} = Object.keys(mapFeatures)
      .reduce((ob, featureType) => {
        console.time('build kd');
        console.log(featureType);
        ob[featureType] = this.geoService.createFastSearchDataset(mapFeatures[featureType]);
        console.timeEnd('build kd');
        return ob;
      }, {});

    // get distances for each cell
    console.time('distances');
    for (const cell of grid) {
      // console.time('cellDistance');
      const cellCenter = center(cell);
      cell.properties.distances = {};

      const { averageAltitude, variance } = await this.altitudeService.getAltitude(bbox(cell), areaBounds);
      cell.properties.altitude = averageAltitude;
      cell.properties.slopiness = variance;

      Object.keys(mapFeatures).forEach(featureType => {
        const featureList = mapFeatures[featureType];

        const nearest = searchDatasets[featureType].getNearest(
          cellCenter.geometry.coordinates[0],
          cellCenter.geometry.coordinates[1],
        );
        cell.properties.distances[featureType] = nearest.distance;
      });
    }
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
