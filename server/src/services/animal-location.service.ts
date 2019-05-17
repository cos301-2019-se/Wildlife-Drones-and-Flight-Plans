import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { AnimalLocation } from '../entity/animal-location';
import { csvReader } from './csv-reader.service'

@Injectable()
export class AnimalLocationService {

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly csvReader: csvReader,
    ) { }

    addAnimalLocationData(): boolean {

        // const con = this.databaseService.getConnection();
        // let addAnimal = con.then(async (data) => {
        //     let animalLocations = new AnimalLocation();
        //             animalLocations.id = 1;
        //             animalLocations.date = '2007/08/13';
        //             animalLocations.year = '2007';
        //             animalLocations.month = '08';
        //             animalLocations.day = '13';
        //             animalLocations.time = '02:00:00.000';
        //             animalLocations.hour = '02';
        //             animalLocations.minute = '00';
        //             animalLocations.second = '00.000';
        //             animalLocations.longitude = '31.87399';
        //             animalLocations.latitude = '-24.81483';            
        //         return data.manager.save(animalLocations).then(animalLocations => { console.log('Saved a new animal loction with id: ' + animalLocations.id) });
        //     });
       
        
        // if (addAnimal != null) {
        //     return true;
        // }
        // else {

        //     return false;
        // }

        return false;
    }

    async addAnimalLocationDataCSV(filename): Promise<void> {
        const csvFile = filename;
        const MAX_BUFFER_SIZE = 50000;
        let buffer: AnimalLocation[] = [];

        const conn = await this.databaseService.getConnection();
        const animalLocations = conn.getRepository(AnimalLocation);
        let id = 0;

        const insertRow = () => {
            const rowsToInsert = buffer;
            buffer = [];

            animalLocations.save(rowsToInsert, {
                chunk: 100,

            });
        }

        this.csvReader.readCSV(csvFile, row => {
            if (typeof row === 'undefined') {
                // end of csv - insert the remaining rows
                insertRow();
                return;
            }

            const rowDate = new Date(row['timestamp']);

            const location: AnimalLocation = {
                animalId: row['individual-local-identifier'],
                latitude: row['location-lat'],
                longitude: row['location-long'],
                timestamp: rowDate,
                temperature: row['external-temperature'],
                habitat: row['habitat'],
                month: rowDate.getMonth()+1,
                time: rowDate.getHours() * 60 + rowDate.getMinutes(),
                id: id++,
            };

            buffer.push(location);
            if (buffer.length == MAX_BUFFER_SIZE) {
                insertRow();
            }
        });
    }

    async getAllAnimalsLocationTableData(): Promise<JSON> {
        const con = await this.databaseService.getConnection();
        let animaldata =  JSON.parse(JSON.stringify( await con.getRepository(AnimalLocation).find()));
        return animaldata;
    }

    async getIndividualAnimalLocationTableData(animalID): Promise<JSON> {
        const con = await this.databaseService.getConnection();
        let animaldata =  JSON.parse(JSON.stringify( await con.getRepository(AnimalLocation).find({ animalId : animalID })));
        return animaldata;
    }

}




