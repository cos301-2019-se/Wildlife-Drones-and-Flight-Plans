import { Injectable } from '@nestjs/common';
import { GeoService } from './geo.service';
import squareGrid from '@turf/square-grid';
import simplify from '@turf/simplify';

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
  public partitionMap(area, features: { roads: any[]; water: any[]; }, cellSizeKm: number = 0.5) {
    console.log('partitioning map');
    const bounds = this.geo.getBoundingBox(area);

    // simplify the area. Kruger would require over 240 million iterations at cellSizeKm = 0.5km
    const simplifiedArea = simplify(JSON.parse(JSON.stringify(area)), {
      mutate: true,
      tolerance: 0.01,
      highQuality: false,
    });

    console.log('area len        ', area.geometry.coordinates[0].length);
    console.log('simple area len ', simplifiedArea.geometry.coordinates[0].length);
    console.log('got bounds');
    const grid = squareGrid(bounds, cellSizeKm, {
      units: 'kilometers',
      mask: simplifiedArea,
    });
    console.log('calculated grid');

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