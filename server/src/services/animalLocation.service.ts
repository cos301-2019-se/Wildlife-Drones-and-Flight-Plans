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
                    animalLocations.animal_id = 1;
                    animalLocations.date = '2007/08/13';
                    animalLocations.year = '2007';
                    animalLocations.month = '08';
                    animalLocations.day = '13';
                    animalLocations.time = '02:00:00.000';
                    animalLocations.hour = '02';
                    animalLocations.minute = '00';
                    animalLocations.second = '00.000';
                    animalLocations.longitude = '31.87399';
                    animalLocations.latitude = '-24.81483';            
                return data.manager.save(animalLocations).then(animalLocations => { console.log("Saved a new animal loction with id: " + animalLocations.id) });
            });
       
        
        if (addAnimal != null) {
            return true;
        }
        else {

            return false;
        }
    }   
}




