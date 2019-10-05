import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { OverpassService } from './services/overpass.service';
import { AnimalLocationService } from './services/animal-location.service';
import { ModelTraining } from './services/model-training.service';
import { AnimalInterestPointService } from './services/animal-interest-point.service';
import { CsvReaderService } from './services/csv-reader.service';
import { SRTMService } from './services/srtm.service';
import { PoachingIncidentTypeService } from './services/poaching-incident-type.service';
import { DroneService } from './services/drone.service';
import { AnimalCellWeightService } from './services/animal-cell-weight.service';
import { PoachingCellWeightService } from './services/poaching-cell-weight.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { ConfigService } from './services/config.service';
import { SpeciesService } from './services/species.service';
import { GeoService } from './services/geo.service';
import { PoachingIncidentService } from './services/poaching-incident.service';
import { AuthService } from './auth/auth.service';
import { MapService } from './services/map.service';
import { RegressionService } from './services/regression.service';
import { CacheInterceptor  } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MailService } from './services/mail.service';
import { DroneRouteService } from './services/drone-route.service';
import { CacheService } from './services/cashe.service';


export const providers = [
  MapService,
  DatabaseService,
  UserService,
  OverpassService,
  GeoService,
  AnimalLocationService,
  AnimalInterestPointService,
  CsvReaderService,
  SRTMService,
  ModelTraining,
  AuthService,
  JwtStrategy,
  PoachingIncidentService,
  PoachingIncidentTypeService,
  SpeciesService,
  DroneService,
  AnimalCellWeightService,
  PoachingCellWeightService,
  ConfigService,
  RegressionService,
  MailService,
  {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
  },
  DroneRouteService,
  CacheService,
];
