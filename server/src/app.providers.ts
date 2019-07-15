import { MapUpdaterService } from './services/map-updater.service';
import { ShortestPathService } from './services/shortest-path.service';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { OverpassService } from './services/overpass.service';
import { AnimalLocationService } from './services/animal-location.service';
import { ModelTraining } from './services/model-training.service';
import { AnimalInterestPointService } from './services/animal-interest-point.service';
import { CsvReader } from './services/csv-reader.service';
import { SRTMService } from './services/srtm.service';
import { RangerService } from './services/ranger.service';
import { PoachingIncidentTypeService } from './services/poaching-incident-type.service';
import { DroneService } from './services/drone.service';
import { DroneRouteService } from './services/drone-route.service';
import { MapCellDataService } from './services/map-cell-data.service';
import { AnimalCellWeightService } from './services/animal-cell-weight.service';
import { PoachingCellWeightService } from './services/poaching-cell-weight.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { ConfigService } from './services/config.service';
import { MapDataService } from './services/map-data.service';
import { SpeciesService } from './services/species.service';
import { ClassifierTraining } from './services/animal-classifier-training.service';
import { GeoService } from './services/geo.service';
import { MapPartitionerService } from './services/map-partitioner.service';
import { PoachingIncidentService } from './services/poaching-incident.service';
import { AuthService } from './auth/auth.service';
import { ModelSaving } from './services/model-saving.service';

export const providers = [
  MapUpdaterService,
  ShortestPathService,
  DatabaseService,
  UserService,
  OverpassService,
  GeoService,
  ClassifierTraining,
  MapPartitionerService,
  AnimalLocationService,
  AnimalInterestPointService,
  CsvReader,
  SRTMService,
  ModelTraining,
  AuthService,
  JwtStrategy,
  RangerService,
  PoachingIncidentService,
  PoachingIncidentTypeService,
  SpeciesService,
  DroneService,
  DroneRouteService,
  MapCellDataService,
  AnimalCellWeightService,
  PoachingCellWeightService,
  ConfigService,
  MapDataService,
  ModelSaving,
];
