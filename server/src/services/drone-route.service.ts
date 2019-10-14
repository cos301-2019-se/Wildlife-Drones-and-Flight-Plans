import { Injectable } from '@nestjs/common';
import { DroneService } from './drone.service';
import { PoachingIncidentService } from './poaching-incident.service';
import { ClarkeWrightProblem, Point } from '../libraries/savings-solver';
import { PredictiveSolver } from '../libraries/predictive-solver';
import { convertLength } from '@turf/helpers';

import distance from '@turf/distance';
import { AnimalLocationService } from './animal-location.service';
import { ModelTraining } from './model-training.service';
import { MapService } from './map.service';

@Injectable()
export class DroneRouteService {
  constructor(
    private readonly droneService: DroneService,
    private readonly poachingIncidentService: PoachingIncidentService,
    private readonly animalLocationsService: AnimalLocationService,
    private readonly modelTrainingService: ModelTraining,
    private readonly mapService: MapService,
  ) {}

  /**
   * Creates a route between incidents
   * @param droneId The ID of the drone being used
   * @param lon The longitude of the starting position
   * @param lat The latitude of the starting position
   * @param since Since when to look at incidents - defaults to a 30 days back
   */
  async createIncidentRoutes(droneId: number, lon: number, lat: number, since: Date = new Date(Date.now() - 30 * 86400000)) {
    const incidents = await this.poachingIncidentService.getAllPoachingIncidentTableData();
    const incidentPoints: Point[] = incidents
      .sort((a, b) => a.timestamp > b.timestamp ? 1 : -1) // sort incidents by their time stamp
      .map((incident, incidentIndex, arr) => new Point(incident.longitude, incident.latitude, 0.5 + incidentIndex / arr.length));

    return await this.createStaticRoute(droneId, lon, lat, incidentPoints);
  }

  /**
   * Creates a route between hotspots
   * @param droneId The ID of the drone being used
   * @param lon The longitude of the starting position
   * @param lat The latitude of the starting position
   */
  async createHotspotRoute(droneId: number, lon: number, lat: number) {
    const hotspots = await this.mapService.getCellHotspots(false);

    console.log('hotspots', hotspots.length, hotspots.slice(0, 3));

    const hotspotPoints = hotspots.map(hotspot => new Point(hotspot.lon, hotspot.lat, hotspot.weight));
    console.log('hotspot points', hotspotPoints.slice(0, 5));

    return await this.createStaticRoute(droneId, lon, lat, hotspotPoints, 500, {
      adjacency: 1.0,
      asymmetry: 0.3,
      demand: 0,
      minSavings: 0.05,
    });
  }

  /**
   * Generates a route for some static points
   * @param droneId The Id of the drone being used
   * @param lon The longitude of the starting position
   * @param lat The latitude of the starting position
   * @param points The points to visit
   * @param sampleSize The maximum number of points to visit (0 = infinity)
   */
  private async createStaticRoute(droneId: number, lon: number, lat: number, points: Point[], sampleSize = 0, weights = {
    adjacency: 1.0,
    asymmetry: 0.2,
    demand: 0.4,
    minSavings: 0.1,
  }) {
    const droneInfo = await this.getDroneInfo(droneId);

    if (!droneInfo) {
      return false;
    }

    const depot = new Point(lon, lat, 0);

    points = points
      .filter(point => distance( // all points within maximum range
        [depot.x, depot.y],
        [point.x, point.y],
        { units: 'degrees' }) <= droneInfo.maxPointDistanceDegrees
      );

    if (sampleSize > 0) {
      points = points.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
    }

    // if no points can possibly be reached, return an empty route
    if (!points.length) {
      console.log('no points found');
      return [];
    }

    // create the problem
    const problem = new ClarkeWrightProblem(points, depot, droneInfo.maxFlightDistanceDegrees);

    // solve the problem
    const routes = problem.solve(weights);

    return routes
      .map(route => [...route.points, route.depot].map(point => [point.x, point.y]));
  }

  /**
   * Attempts to create a shortest path between the chosen animals. Uses the animals'
   * latest positions, then tries to predict future positions and intercept the animals.
   * Takes into account fuel, flight time, etc.
   * @param droneId The ID of the drone used for this route
   * @param depotLon The longitude of the depot (starting point)
   * @param depotLat The latitude of the depot (starting point)
   * @param animaIds List of animal IDs. If incorrect, will be left out
   */
  async createAnimalPredictionRoute(droneId: number, depotLon: number, depotLat: number, animalIds: string[]) {
    const droneInfo = await this.getDroneInfo(droneId);
    if (!droneInfo) {
      return false;
    }

    let predictions = [];
    for (const animalId of animalIds) {
      const nextPositions = await this.modelTrainingService.predictFutureAnimalPosition(animalId, droneInfo.flightTime);
      if (nextPositions && nextPositions.positions.length) {
        predictions.push(nextPositions);
      }
    }

    const predictiveSolver = new PredictiveSolver();

    const routes = predictiveSolver.createRoute(
      convertLength(droneInfo.speed, 'kilometers', 'degrees') / 60 / 60, // drone speed in degrees per second
      droneInfo.maxFlightDistanceDegrees,
      depotLon,
      depotLat,
      predictions,
    );

    return {
      futureLocations: predictions,
      routes,
    };
  }

  /**
   * Finds information about the given drone. Finds the maximum flight distance
   * from speed, flight time. Also finds the maximum distance a drone can fly
   * in a straight line before having to come back (to find flight radius).
   * Multiplies drone flight time by a factor to give a buffer for error.
   * @param droneId The ID of the drone to get information for
   */
  private async getDroneInfo(droneId): Promise<{
    speed: number;
    flightTime: number;
    maxFlightDistanceDegrees: number;
    maxPointDistanceDegrees: number;
  }> {
    const drone = await this.droneService.getDrone(droneId);
    if (!drone) {
      return null;
    }

    const DRONE_FLIGHT_ERROR = 0.9; // account for errors by making the route slightly shorter than the maximum distance

    const speed = drone.avgSpeed;
    const flightTime = drone.avgFlightTime * DRONE_FLIGHT_ERROR;

    const maxFlightDistance = drone.avgSpeed * drone.avgFlightTime / 60;
    const maxFlightDistanceDegrees = convertLength(maxFlightDistance, 'kilometers', 'degrees');
    const maxPointDistanceDegrees = maxFlightDistanceDegrees / 2; // distance to point and back to the depot cannot be greater than maximum flight

    return {
      speed,
      flightTime,
      maxFlightDistanceDegrees,
      maxPointDistanceDegrees,
    };
  }
}
