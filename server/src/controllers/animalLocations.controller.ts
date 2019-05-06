import { Controller, Get, Post } from '@nestjs/common';
import { AnimalLocationService } from '../services/animalLocation.service';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  @Get('addAnimalLocationData')
  addAnimalLocationData(): boolean {
    return this.animalLocationService.addAnimalLocationData();
  }


}
