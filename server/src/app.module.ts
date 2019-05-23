import { Module } from '@nestjs/common';
import {MapController} from './controllers/map.controller';
import { MapUpdaterService } from './providers/map-updater.service';
import { ShortestPathService } from './providers/shortest-path.service';
import { UserController } from './controllers/user.controller';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { OverpassService } from './providers/overpass.service';
import { GeoService } from './providers/geo.service';
import { MapPartitionerService } from './providers/map-partitioner.service';
import { AnimalController } from './controllers/animal-location.controller';
import { AnimalInterestPointController } from './controllers/animal-interest-point.controller';
import { ModelPrediction } from './controllers/model-prediction.controller';
import { AnimalLocationService } from './services/animal-location.service';
import { ModelTraining } from './services/model-training.service';
import { AnimalInterestPointService } from './services/animal-interest-point.service';
import { CsvReader } from './services/csv-reader.service';
import { SRTMService } from './providers/srtm.service';

@Module({
  imports: [],
  controllers: [
    MapController,
    UserController,
    AnimalController,
    AnimalInterestPointController,
    ModelPrediction,
  ],
  providers: [
    MapUpdaterService,
    ShortestPathService,
    DatabaseService,
    UserService,
    OverpassService,
    GeoService,
    MapPartitionerService,
    AnimalLocationService,
    AnimalInterestPointService,
    CsvReader,
    SRTMService,
    ModelTraining,
  ],
})
export class AppModule {}
