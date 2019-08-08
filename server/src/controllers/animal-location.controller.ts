import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';
import { AnimalLocation } from '../entity/animal-location.entity';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  // @Get('addAnimalLocationData')
  // addAnimalLocationData(
  //   @Query('animalId') animalId: string,
  //   @Query('date') date: Date,
  //   @Query('long') long: number,
  //   @Query('lat') lat: number,
  //   @Query('animalSpecies') animalSpecies: string,
  // ): Promise<boolean> {
  //   return this.animalLocationService.addAnimalLocationData(
  //     animalId,
  //     date,
  //     long,
  //     lat,
  //     animalSpecies,
  //   );
  // }
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
  
  // @Get('addAnimalLocationDataCSV')
  // addAnimalLocationDataCSV(@Query('filename') filename: string): void {
  //   this.animalLocationService.addAnimalLocationDataCSV(filename);
  // }

  @Post('addAnimalLocationDataCSV')
  async addAnimalLocationDataCSV (@Body() body) :Promise<void> {
    return await this.animalLocationService.addAnimalLocationDataCSV(body.filename);
  }


  // @Get('getAllAnimalLocationTableData')
  // getAllAnimalsLocationData(): Promise<JSON> {
  //   return this.animalLocationService.getAllAnimalsLocationTableData();
  // }
  @Post('getAllAnimalLocationTableData')
  async getAllAnimalLocationTableData() : Promise<boolean> {
    return await this.getAllAnimalLocationTableData();
  }
  // async getAllAnimalsLocationData(): Promise<JSON> {
  //   return await this.animalLocationService.getAllAnimalsLocationTableData();
  // }

  @Get('getIndividualAnimalLocationTableData')
  getIndividualAnimalLocationData(
    @Query('animalID') animalID: string,
  ): Promise<JSON> {
    return this.animalLocationService.getIndividualAnimalLocationTableData(
      animalID,
    );
  }

  // @Post('getIndividualAnimalLocationTableData')
  // async getIndividualAnimalLocationData(@Body() body ) : Promise<JSON> {
  //   return await this.animalLocationService.getIndividualAnimalLocationTableData(
  //       body.animalId,
  //        );
  // }

  // @Get('getSpeciesLocationTableData')
  // getSpeciesLocationTableData(
  //   @Query('animalSpecies') animalSpecies: string,
  // ): Promise<JSON> {
  //   return this.animalLocationService.getSpeciesLocationTableData(
  //     animalSpecies,
  //   );
  // }
  @Post('getSpeciesLocationTableData')
  async getSpeciesLocationTableData(@Body() body): Promise<AnimalLocation[]> {
    return await this.animalLocationService.getSpeciesLocationTableData(
      body.animalSpecies,
      );
  }
}
