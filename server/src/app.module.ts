import { Module } from '@nestjs/common';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { AnimalLocationService } from './services/animalLocation.service';
import { AnimalIntrestPointService } from './services/animal_intrest_points.service';
import { UserController } from './controllers/user.controller';
import { AnimalController } from './controllers/animalLocations.controller';
import { AnimalIntrestPointController } from './controllers/animal_intrest_points.controller';

@Module({
  imports: [],
  controllers: [ UserController, AnimalController, AnimalIntrestPointController],
  providers: [ DatabaseService, UserService, AnimalLocationService, AnimalIntrestPointService]],
})
export class AppModule {}
