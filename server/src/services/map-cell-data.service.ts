/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { MapCellData } from '../entity/map-cell-data.entity';

@Injectable()
export class MapCellDataService {
  constructor(private readonly databaseService: DatabaseService) {}

  // add cell data to map cell data table in database.
  async addCellData(
    cellMidLongitude: number,
    cellMidLatitude: number,
    cellData: JSON,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const mapCellData = new MapCellData();

    if (cellData['rivers'] == null) cellData['rivers'] = -100;

    if (cellData['dams'] == null) cellData['dams'] = -100;

    if (cellData['roads'] == null) cellData['roads'] = -100;

    if (cellData['residential'] == null) cellData['residential'] = -100;

    if (cellData['intermittentWater'] == null)
      cellData['intermittentWater'] = -100;

    try {
      mapCellData.cellMidLatitude = cellMidLatitude;
      mapCellData.cellMidLongitude = cellMidLongitude;
      mapCellData.lastVisited = new Date();
      mapCellData.distantceToRivers = parseFloat(cellData['rivers']);
      mapCellData.distantceToDams = parseFloat(cellData['dams']);
      mapCellData.distanceToRoads = parseFloat(cellData['roads']);
      mapCellData.distanceToResidences = parseFloat(cellData['residential']);
      mapCellData.distanceToIntermittentWater = parseFloat(
        cellData['intermittentWater'],
      );
      // tslint:disable-next-line:no-console
      const addedMapCellData = await con
        .getRepository(MapCellData)
        .save(mapCellData);
      console.log('Saved a cell data with id: ' + mapCellData.id);
      return addedMapCellData != null;
    } catch (error) {
      console.log(error);
      console.log('Cell data was not saved');
      return false;
    }
  }
}
