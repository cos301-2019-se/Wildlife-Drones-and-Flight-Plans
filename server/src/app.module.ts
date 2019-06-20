import { Module } from '@nestjs/common';
import { MapController } from './controllers/map.controller';
import { MapUpdaterService } from './services/map-updater.service';
import { ShortestPathService } from './services/shortest-path.service';
import { UserController } from './controllers/user.controller';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { OverpassService } from './services/overpass.service';
import { GeoService } from './services/geo.service';
import { MapPartitionerService } from './services/map-partitioner.service';
import { AnimalController } from './controllers/animal-location.controller';
import { AnimalInterestPointController } from './controllers/animal-interest-point.controller';
import { ModelPrediction } from './controllers/model-prediction.controller';
import { AnimalLocationService } from './services/animal-location.service';
import { ModelTraining } from './services/model-training.service';
import { AnimalInterestPointService } from './services/animal-interest-point.service';
import { CsvReader } from './services/csv-reader.service';
import { SRTMService } from './services/srtm.service';
import { SpeciesController } from "./controllers/animal-species.controller";
import { SpeciesService } from "./services/species.service";

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [
    MapController,
    UserController,
    AnimalController,
    AnimalInterestPointController,
    ModelPrediction,
    SpeciesController,
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
    AuthService,
    JwtStrategy,
    SpeciesService,
  ],
  exports: [PassportModule, AuthService],
})
export class AppModule {}
