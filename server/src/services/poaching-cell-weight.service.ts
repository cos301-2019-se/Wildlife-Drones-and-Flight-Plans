/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { PoachingCellWeight } from '../entity/poaching-cell-weight.entity';
import { MapCellData } from '../entity/map-cell-data.entity';

@Injectable()
export class PoachingCellWeightService {
  constructor(private readonly databaseService: DatabaseService) {}

  // add cell data to map cell data table in database.
  async addPoachingCellWeight(
    mapCellId: number,
    weight: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const poachingCellWeight = new PoachingCellWeight();

    const mapCellIdExist = await con
      .getRepository(MapCellData)
      .findOne({ id: mapCellId });

    if (mapCellIdExist == undefined) {
      console.log('Map cell does not exist');
      return false;
    }

    try {
      poachingCellWeight.cell = mapCellIdExist;
      poachingCellWeight.weight = weight;
      // tslint:disable-next-line:no-console
      const addedpoachingCellWeight = await con
        .getRepository(PoachingCellWeight)
        .save(poachingCellWeight);
      console.log(
        'Saved poaching cell weight data with id: ' + poachingCellWeight.id,
      );
      return addedpoachingCellWeight != null;
    } catch (error) {
      console.log(error);
      console.log('Poaching cell weight was not saved');
      return false;
    }
  }

  async addPoachingCellsWeight(data: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();

    const poachingCellWeight = new PoachingCellWeight();

    JSON.parse(JSON.stringify(data)).forEach(async cellData => {
      const mapCellIdExist = await con
        .getRepository(MapCellData)
        .findOne({ id: cellData.cellId });

      if (mapCellIdExist == undefined) {
        console.log('Map cell does not exist');
        return false;
      }

      try {
        poachingCellWeight.cell = mapCellIdExist;
        poachingCellWeight.weight = cellData.weight;
        // tslint:disable-next-line:no-console
        const addedPoachingCellWeight = await con
          .getRepository(PoachingCellWeight)
          .save(poachingCellWeight);
        console.log(
          'Saved poaching cell weight data with id: ' + poachingCellWeight.id,
        );
        return addedPoachingCellWeight != null;
      } catch (error) {
        console.log(error);
        console.log('Poaching cell weight was not saved');
        return false;
      }
    });

    return false;
  }
}
