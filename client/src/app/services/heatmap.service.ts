import { AuthenticationService } from './authentication.service';
import { Injectable } from '@angular/core';
import bboxPolygon from '@turf/bbox-polygon';
import { convertLength } from '@turf/helpers';

export interface Species {
  id: number;
  species: string;
}

export interface MapCell {
  id: number;
  lon: number;
  lat: number;
  weight: number;
  geoJSON: any;
}

@Injectable()
export class HeatmapService {
  constructor(
    private auth: AuthenticationService,
  ) {}

  /**
   * Returns a list of animal species and their IDs.
   * This is necessary for use getting the heatmap
   * data for animal species.
   */
  async getAnimalSpecies(): Promise<Species[]> {
    const res = await this.auth.get('/getSpecies', {});
    return res as Species[];
  }

  /**
   * Get the size of a cell in kilometres
   */
  async getCellSize(): Promise<number> {
    return await this.auth.get('/map/getCellSize', {}) as number;
  }

  /**
   * Fetches the map cells' centres from the database
   * and converts them into GeoJSON representation with
   * weights using getCellSize to calculate the size of
   * the cells.
   */
  async getCells(): Promise<MapCell[]> {
    const res = await this.auth.get('/map/getMapCells', {});

    const cellSize = await this.getCellSize();
    const halfCellSizeDeg = convertLength(cellSize / 2, 'kilometers', 'degrees');

    const cells: MapCell[] = (res as any[]).map(cell => ({
      id: cell.cellId,
      lon: cell.lon, // x
      lat: cell.lat, // y
      weight: 0,
      geoJSON: bboxPolygon([
        cell.lon - halfCellSizeDeg, // minX
        cell.lat - halfCellSizeDeg, // minY
        cell.lon + halfCellSizeDeg, // maxX
        cell.lat + halfCellSizeDeg, // maxY
      ]),
    }));

    return cells;
  }
}
