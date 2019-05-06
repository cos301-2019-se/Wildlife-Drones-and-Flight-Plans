import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Animal_locations } from '../entity/Animal_loactions';

@Injectable()
export class AnimalLocationService {

    constructor(private readonly databaseService: DatabaseService) { }

    addAnimalLocationData(): boolean {

        const con = this.databaseService.getConnection();
        let addAnimal = con.then(async (data) => {
            let animalLocations = new Animal_locations();

           // bcrypt.genSalt(5, function (err, salt) {
                // bcrypt.hash(_password, salt, function(err, hash) {
                animalLocations.Animal_ID = 2;
                animalLocations.date = new Date();
                animalLocations.longatude = "28.282984";
                animalLocations.latitude = "-25.865828";                
                return data.manager.save(animalLocations).then(animalLocations => { console.log("Saved a new user with id: " + animalLocations.id) });
            });
       
        
        if (addAnimal != null) {
            return true;
        }
        else {

            return false;
        }
    }   
}




