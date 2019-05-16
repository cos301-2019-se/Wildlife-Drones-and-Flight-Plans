import { Controller, Get, Post } from '@nestjs/common';
import { AnimalInterestPointService } from '../services/animal-interest-point.service';

@Controller()
export class AnimalIntrestPointController {
  constructor(private readonly animalIntrestPointService: AnimalInterestPointService) {}

  @Get('addAnimalIntretPoint')
  addAnimalIntretPoint(): boolean {
    return this.animalIntrestPointService.addAnimalIntretPoint();
  }


}
