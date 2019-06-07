import { Controller, Get, Post, Query } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  @Get('addAnimalLocationData')
  addAnimalLocationData(): boolean {
    return this.animalLocationService.addAnimalLocationData();
  }

  @Get('addAnimalLocationDataCSV')
  addAnimalLocationDataCSV(@Query('filename') filename: string ): void {
    this.animalLocationService.addAnimalLocationDataCSV(filename);
  }

  @Get('getAllAnimalLocationTableData')
  getAllAnimalsLocationData(): Promise<JSON> {
    return this.animalLocationService.getAllAnimalsLocationTableData();
  }

  @Get('getIndividualAnimalLocationTableData')
  getIndividualAnimalLocationData(@Query('animalID') animalID: string): Promise<JSON> {
    return this.animalLocationService.getIndividualAnimalLocationTableData(animalID);
  }
}
