/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalCellWeight } from '../entity/animal-cell-weight.entity';
import { MapCellData } from '../entity/map-cell-data.entity';
import { Species } from '../entity/animal-species.entity';

@Injectable()
export class AnimalCellWeightService {
  constructor(private readonly databaseService: DatabaseService) {}

  // add cell data to map cell data table in database.
  async addAnimalCellWeight(mapCellId: number, speciesId: number, weight: number): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const animalCellWeight = new AnimalCellWeight();

    const mapCellIdExist = await con
      .getRepository(MapCellData)
      .findOne({ id: mapCellId });

    const speciesIdExist = await con
      .getRepository(Species)
      .findOne({ id: speciesId });

    if (mapCellIdExist == undefined || speciesIdExist == undefined) {
      console.log('animal species or map cell does not exist');
      return false;
    }

    try {
      animalCellWeight.cell = mapCellIdExist;
      animalCellWeight.species = speciesIdExist;
      animalCellWeight.weight = weight;
      // tslint:disable-next-line:no-console
      const addedanimalCellWeight = await con
        .getRepository(AnimalCellWeight)
        .save(animalCellWeight);
      console.log('Saved a cell data with id: ' + animalCellWeight.id);
      return addedanimalCellWeight != null;
    } catch (error) {
      console.log(error);
      console.log('Animal cell weight was not saved');
      return false;
    }
  }
}
