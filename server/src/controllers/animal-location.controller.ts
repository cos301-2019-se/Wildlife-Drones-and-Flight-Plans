import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

   /**
   * Adds animal tracking data to the system
   * Returns a value of true if the function executed sucessfully
   * @param animalId The identification number of the animal in the system
   * @param date The date the data was added to
   * @param animalSpecies The type of species the animal is
   * @param temp Temperature recorded 
   * @param habitat The animal habitat
   * @param lon The longtitude coordinate of the drone's location
   * @param lat The latitude coordinate  of the drone's location
   */
  @Post('addAnimalLocationData')
  async addAnimalLocationData(@Body() body): Promise<boolean> {
       return await this.animalLocationService.addAnimalLocationData(
        body.animalId,
        body.date,
        body.lon,
        body.lat,
        body.animalSpecies,
        body.temp,
        body.habitat,
      );
    }


   /**
   * Used to upload csv files containg tracking data about various animals  
   * Returns a value of true if the function executed sucessfully
   * @param filename The csv file to be uploaded with animal data in it
   */
  @Post('addAnimalLocationDataCSV')
  async addAnimalLocationDataCSV (@Body() body) :Promise<void> {
    return await this.animalLocationService.addAnimalLocationDataCSV(body.filename);
  }


    /**
   * Returns the table containing all the data in the animal location table 
   * Returns a value of true if the function executed sucessfully
   */
  @Post('getAllAnimalLocationTableData')
  async getAllAnimalLocationTableData() : Promise<boolean> {
    return await this.getAllAnimalLocationTableData();
  }
  
   /**
   * Returns information about an individual animal location from the table 
   * Returns a value of true if the function executed sucessfully
   * The information is retrieved from the database
   * @param animalId The identification number of the animal in the system
   */
  @Post('getIndividualAnimalLocationTableData')
  async getIndividualAnimalLocationData(@Body() body ) : Promise<JSON> {
    return await this.animalLocationService.getIndividualAnimalLocationTableData(
        body.animalId,
         );
  }


   /**
   * Returns information species and their location
   * Returns a value of true if the function executed sucessfully
   * The information is retrieved from the database
   * @param animalId The identification number of the animal in the system
   */
  @Post('getSpeciesLocationTableData')
  async getSpeciesLocationTableData(@Body() body): Promise<JSON> {
    return await this.animalLocationService.getSpeciesLocationTableData(
      body.animalSpecies,
      );
  }
}
