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
  geoJSON: any;
}

export interface CellWeightMap {
  [cellId: number]: number;
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
    const res = await this.auth.post('getSpecies', {});
    return res as Species[];
  }

  /**
   * Get the size of a cell in kilometres
   */
  async getCellSize(): Promise<number> {
    return await this.auth.post('map/getCellSize', {}) as number;
  }

  /**
   * Fetches the map cells' centres from the database
   * and converts them into GeoJSON representation with
   * weights using getCellSize to calculate the size of
   * the cells.
   */
  async getCells(): Promise<MapCell[]> {
    const res = await this.auth.post('map/getMapCells', {});

    const cellSize = await this.getCellSize();
    const halfCellSizeDeg = convertLength(cellSize / 2, 'kilometers', 'degrees');
    const halfCellSizeDegX = 1.105 * halfCellSizeDeg;

    const cells: MapCell[] = (res as any[]).map(cell => ({
      id: cell.id,
      lon: cell.lon, // x
      lat: cell.lat, // y
      geoJSON: bboxPolygon([
        cell.lon - halfCellSizeDegX, // minX
        cell.lat - halfCellSizeDeg, // minY
        cell.lon + halfCellSizeDegX, // maxX
        cell.lat + halfCellSizeDeg, // maxY
      ]),
    }));

    return cells;
  }

  /**
   * Returns the poaching cell weights for all cells
   */
  async getPoachingDataCellWeights(): Promise<CellWeightMap> {
    const res = await this.auth.post('map/getCellPoachingWeight', {});

    return res as CellWeightMap;
  }

  /**
   * Returns the animal classifier cell weights for all cells
   * for the given animal species at the given time (in minutes)
   */
  async getSpeciesDataCellWeights(speciesId: number, minutes: number): Promise<CellWeightMap> {
    const res = await this.auth.post('map/getSpeciesWeightDataForTime', {
      species: speciesId,
      time: minutes,
    });

    return res as CellWeightMap;
  }

  async getHotspotsCellWeights(): Promise<Array<{
    cellId: number;
    weight: number;
    lon: number;
    lat: number;
  }>> {
    const res = await this.auth.post('map/getCellHotspots', {
      time: false,
    });

    return res as any;
  }
}
