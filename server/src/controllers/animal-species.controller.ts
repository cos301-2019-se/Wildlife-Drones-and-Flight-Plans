import { Controller, Get, Post, Query } from '@nestjs/common';
import { SpeciesService } from '../services/species.service';

@Controller()
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get('addSpeciesData')
  addSpecies(@Query('speciesType') speciesType : string ): Promise<boolean> {
    return this.speciesService.addSpecies(speciesType);
  }
}
