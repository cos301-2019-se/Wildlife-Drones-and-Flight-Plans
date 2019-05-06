import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Animal_intrest_point } from '../entity/animal_intrest_point';

@Injectable()
export class AnimalIntrestPointService {

    constructor(private readonly databaseService: DatabaseService) { }

    addAnimalIntretPoint(): boolean {

        const con = this.databaseService.getConnection();
        let addAnimal = con.then(async (data) => {
            let animalIntrestPoints = new Animal_intrest_point();

           // bcrypt.genSalt(5, function (err, salt) {
                // bcrypt.hash(_password, salt, function(err, hash) {
                animalIntrestPoints.name = "saltLick";
                animalIntrestPoints.Point_description = "Saltlick at dam point A";
                animalIntrestPoints.longatude = "28.282984";
                animalIntrestPoints.latitude = "-25.865828";                
                return data.manager.save(animalIntrestPoints).then(animalIntrestPoints => { console.log("Saved a new user with id: " + animalIntrestPoints.id) });
            });
       
        
        if (addAnimal != null) {
            return true;
        }
        else {

            return false;
        }
    }   
}




