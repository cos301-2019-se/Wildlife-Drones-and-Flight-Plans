import { MapController } from './controllers/map.controller';
import { UserController } from './controllers/user.controller';
import { AnimalController } from './controllers/animal-location.controller';
import { AnimalInterestPointController } from './controllers/animal-interest-point.controller';
import { ModelPrediction } from './controllers/model-prediction.controller';
import { PoachingIncidentTypeController } from './controllers/poaching-incident-type.controller';
import { PoachingIncidentController } from './controllers/poaching-incident.controller';
import { DroneController } from './controllers/drone.controller';
import { DroneRouteController } from './controllers/drone-route.controller';

export const controllers = [
  MapController,
  UserController,
  AnimalController,
  AnimalInterestPointController,
  ModelPrediction,
  PoachingIncidentController,
  PoachingIncidentTypeController,
  DroneController,
  DroneRouteController,
];
