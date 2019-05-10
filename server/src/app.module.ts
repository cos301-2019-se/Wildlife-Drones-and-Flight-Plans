import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MapController} from './controllers/map.controller';
import { MapUpdaterService } from './providers/map-updater.service';
import { ShortestPathService } from './providers/shortest-path.service';
import { UserController } from './controllers/user.controller';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { AnimalController } from './controllers/animal-location.controller';
import { AnimalIntrestPointController } from './controllers/animal-interest-point.controller';
import { AnimalLocationService } from './services/animal-location.service';
import { AnimalInterestPointService } from './services/animal-interest-point.service';
import { csvReader } from './services/csv-reader.service';

@Module({
  imports: [],
  controllers: [MapController, UserController, AnimalController, AnimalIntrestPointController],
  providers: [MapUpdaterService, ShortestPathService, DatabaseService, UserService, AnimalLocationService, AnimalInterestPointService, csvReader],
})
export class AppModule {}
