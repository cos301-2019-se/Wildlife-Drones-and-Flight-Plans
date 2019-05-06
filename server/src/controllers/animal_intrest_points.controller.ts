import { Controller, Get, Post } from '@nestjs/common';
import { AnimalIntrestPointService } from '../services/animal_intrest_points.service';

@Controller()
export class AnimalIntrestPointController {
  constructor(private readonly animalIntrestPointService: AnimalIntrestPointService) {}

  @Get('addAnimalIntretPoint')
  addAnimalIntretPoint(): boolean {
    return this.animalIntrestPointService.addAnimalIntretPoint();
  }


}
