import { Controller, Get} from '@nestjs/common';
import { AnimalInterestPointService } from '../services/animal-interest-point.service';

@Controller()
export class AnimalInterestPointController {
  constructor(private readonly animalInterestPointService: AnimalInterestPointService) {}

  @Get('addAnimalInterestPoint')
  addAnimalInterestPoint(): boolean {
    return this.animalInterestPointService.addAnimalIntretPoint();
  }


}
