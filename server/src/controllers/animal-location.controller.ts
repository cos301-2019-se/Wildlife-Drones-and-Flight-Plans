import { Controller, Get} from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';

@Controller()
export class AnimalController {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  @Get('addAnimalLocationData')
  addAnimalLocationData(): boolean {
    return this.animalLocationService.addAnimalLocationData();
  }

  @Get('addAnimalLocationDataCSV')
  addAnimalLocationDataCSV(): void {
    this.animalLocationService.addAnimalLocationDataCSV();
    // return true
  }

  @Get('getAllAnimalLocationTableData')
  getAllUsers(): JSON {
    return this.animalLocationService.getAllAnimalLocationTableData();
  }

}
