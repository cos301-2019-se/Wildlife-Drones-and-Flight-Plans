/* tslint:disable:no-console */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { MapCellData } from '../entity/map-cell-data.entity';
import { AnimalCellWeight } from '../entity/animal-cell-weight.entity';
import { PoachingCellWeight } from '../entity/poaching-cell-weight.entity';
import { Normalize } from '../libraries/normalize';

@Injectable()
export class MapCellDataService {
  constructor(private readonly databaseService: DatabaseService) { }

  // add cell data to map cell data table in database.
  async addCellData(
    cellMidLongitude: number,
    cellMidLatitude: number,
    cellData: JSON,
    cellAltitude: number,
    cellSlopiness: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();


    const mapMid = await con.getRepository(MapCellData).findOne({ cellMidLatitude: cellMidLatitude, cellMidLongitude: cellMidLongitude });

    if (cellData['rivers'] == null) cellData['rivers'] = -100;

    if (cellData['dams'] == null) cellData['dams'] = -100;

    if (cellData['roads'] == null) cellData['roads'] = -100;

    if (cellData['residential'] == null) cellData['residential'] = -100;

    if (cellData['intermittentWater'] == null)
      cellData['intermittentWater'] = -100;

    if (mapMid == undefined) {
      try {
        const mapCellData = new MapCellData();
        mapCellData.cellMidLatitude = cellMidLatitude;
        mapCellData.cellMidLongitude = cellMidLongitude;
        mapCellData.lastVisited = new Date();
        mapCellData.distanceToRivers = parseFloat(cellData['rivers']);
        mapCellData.distanceToDams = parseFloat(cellData['dams']);
        mapCellData.distanceToRoads = parseFloat(cellData['roads']);
        mapCellData.distanceToResidences = parseFloat(cellData['residential']);
        mapCellData.distanceToIntermittentWater = parseFloat(
          cellData['intermittentWater'],
        );
        mapCellData.altitude = cellAltitude;
        mapCellData.slopiness = cellSlopiness;
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

    else {
      try {
        mapMid.lastVisited = new Date();
        mapMid.distanceToRivers = parseFloat(cellData['rivers']);
        mapMid.distanceToDams = parseFloat(cellData['dams']);
        mapMid.distanceToRoads = parseFloat(cellData['roads']);
        mapMid.distanceToResidences = parseFloat(cellData['residential']);
        mapMid.distanceToIntermittentWater = parseFloat(
          cellData['intermittentWater'],
        );
        mapMid.altitude = cellAltitude;
        mapMid.slopiness = cellSlopiness;
        // tslint:disable-next-line:no-console
        const addedMapCellData = await con
          .getRepository(MapCellData)
          .save(mapMid);
        console.log('Updated a cell data with id: ' + mapMid.id);
        return addedMapCellData != null;
      } catch (error) {
        console.log(error);
        console.log('Cell data was not saved');
        return false;
      }
    }
  }

  /**
   * Returns cell data from the database
   */
  async getCellsData(): Promise<MapCellData[]> {
    const con = await this.databaseService.getConnection();

    try {
      return await con.getRepository(MapCellData).find();
    } catch (error) {
      console.log(error);
      console.log('Cells data not retrieved');
      return undefined;
    }
  }

  async getMapCells(): Promise<Array<{
    id: number;
    lon: number;
    lat: number;
  }>> {
    const con = await this.databaseService.getConnection();
    try {
      const cellsData = await con.getRepository(MapCellData).find();
      return cellsData.map(cell => ({
        id: cell.id,
        lon: cell.cellMidLongitude,
        lat: cell.cellMidLatitude,
      }));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getSpeciesWeightDataForTime(speciesId: number, time: number):Promise<Array<{
    id: number;
    weight: number;
  }>> {
    const con = await this.databaseService.getConnection();
    try {
      const cellsData = await con.getRepository(AnimalCellWeight).find({
        where: {
          species: speciesId,
        },
        relations: ['species', 'cell'],
      });

      const normalizedWeights = Normalize.normalize(cellsData.map(cd => cd[`time${time}Weight`]))

      return cellsData.map((cell, cellIndex) => ({
        id: cell.cell.id,
        weight: normalizedWeights[cellIndex],
      }));
    } catch (error) {
      console.error('error');
      return undefined;
    }
  }

  async getCellPoachingWeight(): Promise<Array<{
    id: number;
    weight: number;
  }>> {
    const con = await this.databaseService.getConnection();
    try {
      console.log('Getting cell data');
      const cellsData = await con.getRepository(PoachingCellWeight).find({
        relations: ['cell']
      });
      console.log('Got cell data', cellsData.length);

      const normalizedWeights = Normalize.normalize(cellsData.map(cw => cw.weight));

      return cellsData.map((cd, cdIdx) => ({
        id: cd.cell.id,
        weight: normalizedWeights[cdIdx],
      }));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  // async getMapCells(): Promise<Array<{
  //   id: number;
  //   lon: number;
  //   lat: number;
  //   poachingWeight: number;
  //   animalWeights: Array<{
  //     speciesId: number;
  //     weights: number[];
  //   }>;
  // }>> 
  // {
  //   const con = await this.databaseService.getConnection();

  //   try {    
  //     const cellsData = await con.getRepository(MapCellData).find({
  //       loadEagerRelations: true,
  //       relations: ["animalCell","poachingCell", "animalCell.species"]

  //     });// .createQueryBuilder('data')
  //     // return cellsData

  //     return cellsData.map(cell => ({
  //       id: cell.id,
  //       lon: cell.cellMidLongitude,
  //       lat: cell.cellMidLatitude,
  //       poachingWeight: (cell.poachingCell[0] ? cell.poachingCell[0].weight : undefined),
  //       animalWeights: (cell.animalCell.length ? cell.animalCell.map(animalCell => ({
  //         speciesId: animalCell.species.id,
  //         weights: Array.from({ length: 12 }, (v, k) => k * 120)
  //                       .map(minute => animalCell[`time${minute}Weight`]),
  //       })) : []),
  //     }));
  //   } catch (error) {
  //     console.log(error);
  //     console.log('Cells data not retrieved');
  //     //return JSON.parse('false');
  //     return undefined;
  //   }
  // }
}
