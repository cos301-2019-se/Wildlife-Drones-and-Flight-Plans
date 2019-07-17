import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { SpeciesService } from '../services/species.service';

@Controller()
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

    /**
   * Adds a new species to the system
   * Returns a value of true if the function executed sucessfully
   * The information is retrieved from the database
   * @param speciesType The type of species being added
   */
  @Post('addSpeciesData')
  async addSpecies(@Body() body) :Promise<boolean>{
  return await this.speciesService.addSpecies(body.speciesType);
  }
}
