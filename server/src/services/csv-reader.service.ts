import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Animal_locations } from '../entity/animal-loaction';
import { json } from 'body-parser';

@Injectable()
export class csvReader {

    constructor(private readonly databaseService: DatabaseService) { }



    addAnimalLocationDataFromCSV(csvfilename): void 
    {        
        const con = this.databaseService.getConnection();

        /*
        *the function reads the whole csv file then creates a json object, that has all the csv data in it
        */
        const csvFilePath =  csvfilename//"ThermochronTracking Elephants Kruger 2007.csv"; // the csv file to read, it currently has to be in the server folder
        const csv = require('csvtojson');
        csv()
            .fromFile(csvFilePath)
            .then((jsonObj) => {
                //the jsonObj contains all the csv data
                
                //console.log(jsonObj.length);
                /*
                    this saves the data to database one for one
                */
                let addAnimal = con.then(async (d) => {
                    //let animalLocations = new Animal_locations();

                    let sizeofdata = 50000;
                    if(jsonObj.length < 50000)
                        sizeofdata = jsonObj.length

                        for (let a = 0; a < sizeofdata; a++) 
                        {
                            let animalLocations = new Animal_locations();
                            if (jsonObj[a]["individual-local-identifier"] == "AM105")
                                animalLocations.animal_id = "1";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM107")
                                animalLocations.animal_id = "2";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM108")
                                animalLocations.animal_id = "3";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM110")
                                animalLocations.animal_id = "4";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM239")
                                animalLocations.animal_id = "5";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM253")
                                animalLocations.animal_id = "6";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM254")
                                animalLocations.animal_id = "7";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM255")
                                animalLocations.animal_id = "8";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM306")
                                animalLocations.animal_id = "9";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM307")
                                animalLocations.animal_id = "10";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM308")
                                animalLocations.animal_id = "11";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM91")
                                animalLocations.animal_id = "12";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM93")
                                animalLocations.animal_id = "13";
                            else if (jsonObj[a]["individual-local-identifier"] == "AM99")
                                animalLocations.animal_id = "14";


                            // animalLocations.animal_id =  "1";
                            animalLocations.timestamp = jsonObj[a]["timestamp"];
                            animalLocations.date = jsonObj[a]["timestamp"].substring(0,9);
                            animalLocations.year = jsonObj[a]["timestamp"].substring(0, 4);// '2007';
                            animalLocations.month = jsonObj[a]["timestamp"].substring(4, 2);//'08';
                            animalLocations.day = jsonObj[a]["timestamp"].substring(8, 2);//'13';
                            animalLocations.time = jsonObj[a]["timestamp"].substring(11, 8);//'02:00:00.000';
                            animalLocations.hour = jsonObj[a]["timestamp"].substring(11, 2);//'02';
                            animalLocations.minute = jsonObj[a]["timestamp"].substring(14, 2);//'00';
                            animalLocations.second = jsonObj[a]["timestamp"].substring(17, 8);//'00.000';
                            animalLocations.longitude = jsonObj[a]["location-long"]; //'31.87399';
                            animalLocations.latitude = jsonObj[a]["location-lat"];//'-24.81483'; 
                            animalLocations.temperature = jsonObj[a]["external-temperature"];
                            animalLocations.habitat = jsonObj[a]["habitat"];
                            animalLocations.individuallocalidentifier = jsonObj[a]["individual-local-identifier"];
                            d.manager.save(animalLocations);
                        }
                   
                })

            }
            
            );
    }
}



