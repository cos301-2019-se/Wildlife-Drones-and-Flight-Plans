/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalInterestPoint } from '../entity/animal-interest-point';

@Injectable()
export class AnimalInterestPointService {

    constructor(private readonly databaseService: DatabaseService) { }

    async addAnimalInterestPoint(): Promise<boolean> {
        const con = await this.databaseService.getConnection();
        const animalInterestPoints = new AnimalInterestPoint();

        animalInterestPoints.name = 'saltLick';
        animalInterestPoints.pointDescription = 'Saltlick at dam point A';
        animalInterestPoints.longitude = '28.282984';
        animalInterestPoints.latitude = '-25.865828';
            // tslint:disable-next-line:no-console
        const addedAnimal = await con.manager.save(animalInterestPoints);
        console.log('Saved a new animal interest point with id: ' + animalInterestPoints.id);
        return addedAnimal != null;
    }
}




