import { Injectable } from '@nestjs/common';
import { GeoService } from './geo.service';
import squareGrid from '@turf/square-grid';

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
  public partitionMap(area, features: { roads: any[]; water: any[]; }, cellSizeKm: number = 2) {
    console.log('partitioning map');
    const bounds = this.geo.getBoundingBox(area);

    console.log('got bounds');
    const grid = squareGrid(bounds, cellSizeKm, {
      units: 'kilometers',
      mask: area,
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