import { Injectable } from '@nestjs/common';
import { DroneService } from './drone.service';
import { PoachingIncidentService } from './poaching-incident.service';
import { ClarkeWrightProblem, Point } from '../libraries/savings-solver';
import { convertLength } from '@turf/helpers';

import distance from '@turf/distance';
import { AnimalLocationService } from './animal-location.service';
import { ModelTraining } from './model-training.service';
import getDistance from '@turf/distance';
import { lineString } from '@turf/helpers';
import lineSliceAlong from '@turf/line-slice-along';
import getBearing from '@turf/bearing';
const Victor = require('victor');
// import * as Victor from 'victor';

@Injectable()
export class DroneRouteService {
  constructor(
    private readonly droneService: DroneService,
    private readonly poachingIncidentService: PoachingIncidentService,
    private readonly animalLocationsService: AnimalLocationService,
    private readonly modelTrainingService: ModelTraining,
  ) {}

  /**
   * Creates a route between incidents
   * @param droneId The ID of the drone being used
   * @param lon The longitude of the starting position
   * @param lat The latitude of the starting position
   * @param since Since when to look at incidents - defaults to a 30 days back
   */
  async createIncidentRoutes(droneId: number, lon: number, lat: number, since: Date = new Date(Date.now() - 30 * 86400000)) {
    const droneInfo = await this.getDroneInfo(droneId);

    const depot = new Point(lon, lat, 0);

    const incidents = await this.poachingIncidentService.getAllPoachingIncidentTableData();
    const incidentPoints: Point[] = incidents
      // all incidents within maximum range
      .filter(incident => distance(
        [depot.x, depot.y],
        [incident.longitude, incident.latitude],
        { units: 'degrees' }) <= droneInfo.maxPointDistanceDegrees
      )
      .sort((a, b) => a.timestamp > b.timestamp ? 1 : -1) // sort incidents by their time stamp
      .map((incident, incidentIndex, arr) => new Point(incident.longitude, incident.latitude, 0.5 + incidentIndex / arr.length));

    // if no points can possibly be reached, return an empty route
    if (!incidentPoints.length) {
      return [];
    }

    // create the problem
    const problem = new ClarkeWrightProblem(incidentPoints, depot, droneInfo.maxFlightDistanceDegrees);

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

    // cannot find a route if the drone does not move
    if (droneInfo.speed <= 0) {
      return [];
    }

    console.log('drone info', droneInfo);

    // find future locations for all chosen animals
    const predictions = [];
    for (const animalId of animalIds) {
      const nextPositions = await this.modelTrainingService.predictFutureAnimalPosition(animalId, droneInfo.flightTime);
      if (nextPositions && nextPositions.positions.length) {
        predictions.push(nextPositions);
      }
    }

    console.log('predictions', predictions.map(p => p.positions));

    // find intercept
    const getIntercept = (dronePosition: [number, number], timeElapsed, droneSpeedDeg, animalSpeed, animalPositions): [number, number] => {
      const animalDistanceTravelled = timeElapsed * animalSpeed;
      const animalSpeedDeg = convertLength(animalSpeed, 'kilometers', 'degrees');

      // first, account for the distance along the line the elephant has moved
      const geoLine = lineString(animalPositions);
      const offsetLine = lineSliceAlong(
        geoLine,
        animalDistanceTravelled,
        Infinity,
        { units: 'kilometers' },
      );

      const points: any[] = offsetLine.geometry.coordinates;

      // find the interception point
      const lines = points.reduce((acc, p, i) => {
        if (i === points.length - 1) {
          return acc;
        }
        acc.push([p, points[i + 1]]);
        return acc;
      }, []);

      // to solve quadratic equation
      const solveQuadratic = (a, b, c, multiplier = 1) => (
        -1 * b + multiplier * Math.sqrt(b * b - 4 * a * c)
      ) / (2 * a);

      /*
        To calculate the intercept, we treat the path the animal goes on
        as multiple lines. Each of these lines is tested for an intersection
        point. If there is no intersection point, it tests the next line
        segment in the path.

        We find the intercept as follows:
        We know where the animal line starting point is and what its direction
        is and its velocity.
        We also know where the drone starts and what its velocity is. We treat
        the area the drone can reach as a circle.
        We then find the intercept between the circle and the animal's path.
      */
      for (const line of lines) {
        // get bearing of the line, where the x axis is 0 degrees
        const bearing = 90 - getBearing(line[0], line[1]);
        // calculate the animal's movement vector ("gradient" * speed)
        const animalMovementVector = new Victor(
          Math.cos(bearing / 180 * Math.PI),
          Math.sin(bearing / 180 * Math.PI)
        ).multiplyScalar(animalSpeedDeg); // velocity vector of target

        // the starting points of the animal and drone
        const animalStart = new Victor(line[0][0], line[0][1]); // starting point of the target
        const droneStart = new Victor(dronePosition[0], dronePosition[1]); // starting drone position

        const a = animalMovementVector.clone().dot(animalMovementVector) - droneSpeedDeg * droneSpeedDeg;
        const b = 2 * animalStart.clone().subtract(droneStart).dot(animalMovementVector);
        const c = animalStart.clone().subtract(droneStart).dot(animalStart.clone().subtract(droneStart));

        // solve quadratic equation for a, b, c to find time
        const solutionA = solveQuadratic(a, b, c, 1);
        const solutionB = solveQuadratic(a, b, c, -1);

        // only positive solution is the correct one (time cannot be negative)
        const t = Math.max(solutionA, solutionB);
        // find the point along the line the animal would be at for the found time
        const interception = animalStart.clone().add(animalMovementVector.clone().multiplyScalar(t));

        // check that the intercept point is actually on the line
        const lineDistance = getDistance(line[0], line[1], { units: 'degrees' });
        const interceptionDistance = getDistance(line[0], [interception.x, interception.y], { units: 'degrees' });

        // if the point isn't on the line, then try the next line segment
        if (interceptionDistance > lineDistance) {
          continue;
        }

        // if the point is on the line, then return the interception point
        return [interception.x, interception.y];
      }

      return [undefined, undefined];
    };

    // calculate all permutations of predictions (i.e. for each animal)
    const permutations = [];
    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        permutations.push(m);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    };
    permute(predictions);

    console.log('permutations', permutations.length);

    const droneSpeedDeg = convertLength(droneInfo.speed / 60, 'kilometers', 'degrees');

    let bestDistance = Infinity;
    let bestPath = null;
    // now try find paths from depot to points, taking into account maximum distance
    for (const permutation of permutations) {
      const paths = [];
      let totalDistance = 0;
      let distanceElapsed = 0;

      let activePath: Array<[number, number]> = [[depotLon, depotLat]];
      let lastPosition = activePath[0];

      for (const predictedPath of permutation) {
        const interceptPoint = getIntercept(
          lastPosition,
          distanceElapsed / droneSpeedDeg,
          droneSpeedDeg,
          predictedPath.speed,
          predictedPath.positions,
        );

        // distance from last point to the predicted point
        // if the distance to the point from the last point and then back to the depo
        // is too great, then return to the depot and start a new route
        const pointDistance = getDistance(lastPosition, interceptPoint, { units: 'degrees'});
        const distanceBackToDepot = getDistance(interceptPoint, [depotLon, depotLat], { units: 'degrees' });

        if (distanceElapsed + pointDistance + distanceBackToDepot > droneInfo.maxFlightDistanceDegrees) {
          // end this path
          activePath.push([depotLon, depotLat]);
          paths.push(activePath);

          // create a new path
          activePath = [[depotLon, depotLat], interceptPoint];
          lastPosition = [depotLon, depotLat];
          distanceElapsed = 0;

          totalDistance += pointDistance + distanceBackToDepot;
        } else {
          activePath.push(interceptPoint);
          lastPosition = interceptPoint;
          distanceElapsed += pointDistance;
          totalDistance += pointDistance;
        }
      }

      // if the last path did not exceed the maximum distance, add it
      if (paths.indexOf(activePath) === -1 && activePath.length > 1) {
        activePath.push([depotLon, depotLat]);
        paths.push(activePath);
      }

      // check if it is the best path
      if (totalDistance < bestDistance) {
        bestPath = paths;
        bestDistance = totalDistance;
      }
    }

    return bestPath.filter(route => {
      const totalDistance = route.reduce((sum, point, index) => {
        if (index === route.length - 1) {
          return sum;
        }
        const pointDistance = getDistance(point, route[index], { units: 'degrees' });
        return sum + pointDistance;
      }, 0);
      return totalDistance < droneInfo.maxFlightDistanceDegrees;
    });


    // TODO: find all possible combinations of the routes without duplicate individuals
    // then find paths from depot to points, taking into account maximum distance
    // then after calculating a set of routes, take the ones with the shortest over-all distance

    // TODO: also return the animal future positions so we can display them on the ma
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
      throw new Error('The drone could not be found');
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
