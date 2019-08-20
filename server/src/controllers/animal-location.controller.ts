import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';
import { AnimalLocation } from '../entity/animal-location.entity';
import { AdminGuard } from 'src/auth/admin.guard';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}
  @UseGuards(AuthGuard('jwt'),AdminGuard)
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
  @UseGuards(AuthGuard('jwt'),AdminGuard)
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
}
