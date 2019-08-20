import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';
import { AnimalLocation } from '../entity/animal-location.entity';
import { ModelTraining } from '../services/model-training.service';

@Controller()
export class AnimalController {
  constructor(
    private readonly animalLocationService: AnimalLocationService,
    private readonly modelTrainingService: ModelTraining,
  ) {}

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
  @Post('addAnimalLocationDataCSV')
  async addAnimalLocationDataCSV(@Body() body): Promise<void> {
    return await this.animalLocationService.addAnimalLocationDataCSV(
      body.filename,
    );
  }

  @Post('getAllAnimalLocationTableData')
  async getAllAnimalLocationTableData(): Promise<boolean> {
    return await this.getAllAnimalLocationTableData();
  }

  @Post('getIndividualAnimalLocationTableData')
  async getIndividualAnimalLocationData(@Body() body): Promise<AnimalLocation[]> {
    return await this.animalLocationService.getIndividualAnimalLocationTableData(
      body.animalId,
    );
  }

  @Post('getSpeciesLocationTableData')
  async getSpeciesLocationTableData(@Body() body): Promise<AnimalLocation[]> {
    return await this.animalLocationService.getLocationDataBySpeciesId(
      body.animalSpecies,
    );
  }

  @Post('getAnimalIds')
  async getAnimalIds(): Promise<string[]> {
    return await this.animalLocationService.getAnimalIds();
  }

  @Post('getAnimalLocations')
  async getAnimalLocations() {
    const lastFewLocations = await this.animalLocationService.getLastFewAnimalLocations('AM105');

    this.modelTrainingService.predictFutureAnimalPosition('AM105', 60);


    return lastFewLocations;
  }
}
