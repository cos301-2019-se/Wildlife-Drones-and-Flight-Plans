/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalCellWeight } from '../entity/animal-cell-weight.entity';
import { MapCellData } from '../entity/map-cell-data.entity';
import { Species } from '../entity/animal-species.entity';

@Injectable()
export class AnimalCellWeightService {
  constructor(private readonly databaseService: DatabaseService) {}
 /**
  * Description - Adds animal cell weights to animalCellWeights table, 
  *               returns true if data successfully inserted and false if 
  *               data not inserted.
  * Usage - the parameter cellData is an Json object that looks as follows
  *         {"cellId":1,"speciesId":1,"time0Weight":0.5,"time120Weight":0.5
  *         ,"time240Weight":0.5,"time360Weight":0.5,"time480Weight":0.5
  *         ,"time600Weight":0.5,"time720Weight":0.5,"time840Weight":0.5
  *         ,"time960Weight":0.5,"time1080Weight":0.5,"time1200Weight":0.5
  *         ,"time1320Weight":0.5}
  * @param cellData 
  * @returns true|false
  */

  async addAnimalCellsWeight(cellData): Promise<boolean> {
    const con = await this.databaseService.getConnection();

    const mapCellIdExist = await con
      .getRepository(MapCellData)
      .findOne({ id: cellData.cellId });
    if (!mapCellIdExist) {
      console.error('map cell does not exist for id', cellData.cellId);
      return false;
    }

    const speciesIdExist = await con
      .getRepository(Species)
      .findOne({ id: cellData.speciesId });
    if (!speciesIdExist) {
      console.error('animal species does not exist for id', cellData.speciesId);
      return false;
    }

    const cellWeight = await con
      .getRepository(AnimalCellWeight)
      .findOne({ cell: mapCellIdExist, species: speciesIdExist });

    if (cellWeight == undefined) {
      const animalCellWeight = new AnimalCellWeight();
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
        // console.log('Saved animal cell weight with id: ' + animalCellWeight.id);
        return addedAnimalCellWeight != null;
      } catch (error) {
        console.log(error);
        console.log('Animal cell weight was not saved');
        return false;
      }
    }
    else{
      try {
        cellWeight.cell = mapCellIdExist;
        cellWeight.species = speciesIdExist;
        cellWeight.time0Weight = cellData.weight0;
        cellWeight.time120Weight = cellData.weight120;
        cellWeight.time240Weight = cellData.weight240;
        cellWeight.time360Weight = cellData.weight360;
        cellWeight.time480Weight = cellData.weight480;
        cellWeight.time600Weight = cellData.weight600;
        cellWeight.time720Weight = cellData.weight720;
        cellWeight.time840Weight = cellData.weight840;
        cellWeight.time960Weight = cellData.weight960;
        cellWeight.time1080Weight = cellData.weight1080;
        cellWeight.time1200Weight = cellData.weight1200;
        cellWeight.time1320Weight = cellData.weight1320;
        // tslint:disable-next-line:no-console
        const updatedAnimalCellWeight = await con
          .getRepository(AnimalCellWeight)
          .save(cellWeight);
         //console.log('updated animal cell weight with id: ' + updatedAnimalCellWeight.id);
        return updatedAnimalCellWeight != null;
      } catch (error) {
        console.log(error);
        console.log('Animal cell weight was not updated');
        return false;
      }
    }
  }
}
