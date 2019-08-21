import { Injectable } from '@nestjs/common';
import { DroneService } from './drone.service';
import { PoachingIncidentService } from './poaching-incident.service';
import { ClarkeWrightProblem, Point } from '../libraries/savings-solver';
import { convertLength } from '@turf/helpers';

import distance from '@turf/distance';

@Injectable()
export class DroneRouteService {
  constructor(
    private readonly droneService: DroneService,
    private readonly poachingIncidentService: PoachingIncidentService,
  ) {}

  /**
   * Creates a route between incidents
   * @param droneId The ID of the drone being used
   * @param lon The longitude of the starting position
   * @param lat The latitude of the starting position
   * @param since Since when to look at incidents - defaults to a 30 days back
   */
  async createIncidentRoutes(droneId: number, lon: number, lat: number, since: Date = new Date(Date.now() - 30 * 86400000)) {
    const drone = await this.droneService.getDrone(droneId);
    if (!drone) {
      return false;
    }

    const DRONE_FLIGHT_ERROR = 0.9; // account for errors by making the route slightly shorter than the maximum distance

    const maxFlightDistance = DRONE_FLIGHT_ERROR * drone.avgSpeed * drone.avgFlightTime / 60;
    console.log('max flight distance', maxFlightDistance);
    const maxFlightDistanceDegrees = convertLength(maxFlightDistance, 'kilometers', 'degrees');
    console.log('max flight distance degress', maxFlightDistanceDegrees);
    const maxPointDistanceDegrees = maxFlightDistanceDegrees / 2; // distance to point and back to the depot cannot be greater than maximum flight
    console.log('max point distance', maxPointDistanceDegrees);

    const depot = new Point(lon, lat, 0);

    const incidents = await this.poachingIncidentService.getAllPoachingIncidentTableData();
    const incidentPoints: Point[] = incidents
      // all incidents within maximum range
      .filter(incident => distance(
        [depot.x, depot.y],
        [incident.longitude, incident.latitude],
        { units: 'degrees' }) <= maxPointDistanceDegrees
      )
      .sort((a, b) => a.timestamp > b.timestamp ? 1 : -1) // sort incidents by their time stamp
      .map((incident, incidentIndex, arr) => new Point(incident.longitude, incident.latitude, 0.5 + incidentIndex / arr.length));

    // if no points can possibly be reached, return an empty route
    if (!incidentPoints.length) {
      return [];
    }

    // create the problem
    const problem = new ClarkeWrightProblem(incidentPoints, depot, maxFlightDistanceDegrees);

    // solve the problem
    const routes = problem.solve({
      adjacency: 1.0,
      asymmetry: 0.2,
      demand: 0.4,
      minSavings: 0.1,
    });

    return routes
      .map(route => [route.depot, ...route.points, route.depot].map(point => [point.x, point.y]));
  }
}
