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
  async addAnimalCellWeight(
    mapCellId: number,
    speciesId: number,
    weight0: number,
    weight120: number,
    weight240: number,
    weight360: number,
    weight480: number,
    weight600: number,
    weight720: number,
    weight840: number,
    weight960: number,
    weight1080: number,
    weight1200: number,
    weight1320: number,
    // weight1440: number,
  ): Promise<boolean> {
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
      animalCellWeight.time0Weight = weight0;
      animalCellWeight.time120Weight = weight120;
      animalCellWeight.time240Weight = weight240;
      animalCellWeight.time360Weight = weight360;
      animalCellWeight.time480Weight = weight480;
      animalCellWeight.time600Weight = weight600;
      animalCellWeight.time720Weight = weight720;
      animalCellWeight.time840Weight = weight840;
      animalCellWeight.time960Weight = weight960;
      animalCellWeight.time1080Weight = weight1080;
      animalCellWeight.time1200Weight = weight1200;
      animalCellWeight.time1320Weight = weight1320;

      // tslint:disable-next-line:no-console
      const addedAnimalCellWeight = await con
        .getRepository(AnimalCellWeight)
        .save(animalCellWeight);
      console.log('Saved animal cell weight with id: ' + animalCellWeight.id);
      return addedAnimalCellWeight != null;
    } catch (error) {
      console.log(error);
      console.log('Animal cell weight was not saved');
      return false;
    }
  }

  async addAnimalCellsWeight(data: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();

    const animalCellWeight = new AnimalCellWeight();
    let passed = true;
    JSON.parse(JSON.stringify(data)).forEach(async cellData => {
      const mapCellIdExist = await con
        .getRepository(MapCellData)
        .findOne({ id: cellData.cellId });

      const speciesIdExist = await con
        .getRepository(Species)
        .findOne({ id: cellData.speciesId });

      if (mapCellIdExist == undefined || speciesIdExist == undefined) {
        console.log('animal species or map cell does not exist');
        passed = false;
        return false;
      }

      try {
        animalCellWeight.cell = mapCellIdExist;
        animalCellWeight.species = speciesIdExist;
        animalCellWeight.time0Weight = cellData.weight0;
        animalCellWeight.time120Weight = cellData.weight120;
        animalCellWeight.time240Weight = cellData.weight240;
        animalCellWeight.time360Weight = cellData.weight360;
        animalCellWeight.time480Weight = cellData.weight480;
        animalCellWeight.time600Weight = cellData.weight600;
        animalCellWeight.time720Weight = cellData.weight720;
        animalCellWeight.time840Weight = cellData.weight840;
        animalCellWeight.time960Weight = cellData.weight960;
        animalCellWeight.time1080Weight = cellData.weight1080;
        animalCellWeight.time1200Weight = cellData.weight1200;
        animalCellWeight.time1320Weight = cellData.weight1320;
        // tslint:disable-next-line:no-console
        const addedAnimalCellWeight = await con
          .getRepository(AnimalCellWeight)
          .save(animalCellWeight);
        console.log('Saved animal cell weight with id: ' + animalCellWeight.id);
        return addedAnimalCellWeight != null;
      } catch (error) {
        console.log(error);
        console.log('Animal cell weight was not saved');
        passed = false;
        return false;
      }
    });

    return passed;
  }
}
