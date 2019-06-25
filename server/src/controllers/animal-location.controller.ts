import { Controller, Get, Post, Query } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  @Get('addAnimalLocationData')
  addAnimalLocationData(
    @Query('animalId') animalId: string,
    @Query('date') date: Date,
    @Query('long') long: number,
    @Query('lat') lat: number,
    @Query('animalSpecies') animalSpecies: string,
  ): Promise<boolean> {
    return this.animalLocationService.addAnimalLocationData(
      animalId,
      date,
      long,
      lat,
      animalSpecies,
    );
  }

  @Get('addAnimalLocationDataCSV')
  addAnimalLocationDataCSV(@Query('filename') filename: string): void {
    this.animalLocationService.addAnimalLocationDataCSV(filename);
  }

  @Get('getAllAnimalLocationTableData')
  getAllAnimalsLocationData(): Promise<JSON> {
    return this.animalLocationService.getAllAnimalsLocationTableData();
  }

  @Get('getIndividualAnimalLocationTableData')
  getIndividualAnimalLocationData(
    @Query('animalID') animalID: string,
  ): Promise<JSON> {
    return this.animalLocationService.getIndividualAnimalLocationTableData(
      animalID,
    );
  }

  @Get('getSpeciesLocationTableData')
  getSpeciesLocationTableData(
    @Query('animalSpecies') animalSpecies: string,
  ): Promise<JSON> {
    return this.animalLocationService.getSpeciesLocationTableData(
      animalSpecies,
    );
  }
}
