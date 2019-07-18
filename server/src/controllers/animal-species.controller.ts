import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { SpeciesService } from '../services/species.service';
import { Species } from 'src/entity/animal-species.entity';

@Controller()
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  // @Get('addSpeciesData')
  // addSpecies(@Query('speciesType') speciesType: string): Promise<boolean> {
  //   return this.speciesService.addSpecies(speciesType);
  // }
  @Post('addSpeciesData')
  async addSpecies(@Body() body): Promise<boolean> {
    return await this.speciesService.addSpecies(body.speciesType);
  }

  @Post('getSpecies')
  async getSpecies(): Promise<Species[]> {
    return await this.speciesService.getSpecies();
  }
}
