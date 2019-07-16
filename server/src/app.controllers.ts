import { MapController } from './controllers/map.controller';
import { UserController } from './controllers/user.controller';
import { AnimalController } from './controllers/animal-location.controller';
import { AnimalInterestPointController } from './controllers/animal-interest-point.controller';
import { ModelPrediction } from './controllers/model-prediction.controller';
import { RangerController } from './controllers/ranger.controller';
import { PoachingIncidentTypeController } from './controllers/poaching-incident-type.controller';
import { PoachingIncidentController } from './controllers/poaching-incident.controller';
import { DroneController } from './controllers/drone.controller';
import { DroneRouteController } from './controllers/drone-route.controller';
import { SpeciesController } from './controllers/animal-species.controller';

export const controllers = [
  MapController,
  UserController,
  AnimalController,
  AnimalInterestPointController,
  ModelPrediction,
  RangerController,
  PoachingIncidentController,
  PoachingIncidentTypeController,
  SpeciesController,
  DroneController,
  DroneRouteController,
];
