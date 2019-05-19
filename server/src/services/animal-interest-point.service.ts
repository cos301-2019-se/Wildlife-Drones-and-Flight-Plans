import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalInterestPoint } from '../entity/animal-interest-point';

@Injectable()
export class AnimalInterestPointService {

    constructor(private readonly databaseService: DatabaseService) { }

    addAnimalIntretPoint(): boolean {

        const con = this.databaseService.getConnection();
        let addAnimal = con.then(async (data) => {
            let animalIntrestPoints = new AnimalInterestPoint();

            animalIntrestPoints.name = "saltLick";
            animalIntrestPoints.pointDescription = "Saltlick at dam point A";
            animalIntrestPoints.longitude = "28.282984";
            animalIntrestPoints.latitude = "-25.865828";
            return data.manager.save(animalIntrestPoints).then(animalIntrestPoints => { console.log("Saved a new animal intrestpoint with id: " + animalIntrestPoints.id) });
        });


        if (addAnimal != null) {
            return true;
        }
        else {

            return false;
        }
    }
}




