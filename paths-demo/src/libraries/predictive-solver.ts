import getDistance from '@turf/distance';
import lineSliceAlong from '@turf/line-slice-along';
import getBearing from '@turf/bearing';
import { lineString } from '@turf/helpers';
const Victor = require('victor');
// import * as Victor from 'victor';

export class PredictiveSolver {
  /**
   * Finds all possible permutations of the given paths.
   * For each permutation, finds the intercept of the drone with the paths
   * and then chooses the most optimal route.
   * @param droneSpeedDeg Drone speed in degrees per second
   * @param droneMaxFlightDistanceDeg drone max flight distance in degrees
   * @param depotLon depot longitude
   * @param depotLat depot latitude
   * @param futurePaths future paths array. All speeds should be in degrees per second. Positions are [lon, lat]
   */
  createRoute(droneSpeedDeg, droneMaxFlightDistanceDeg, depotLon, depotLat, futurePaths: Array<{
    speed: number,
    positions: number[][],
  }>) {
    if (droneSpeedDeg <= 0) {
      return [];
    }

    // calculate all permutations of predictions (i.e. for each target)
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
    permute(futurePaths);


    // now go through permutations and find the best route to take

    let bestPointsReached = -Infinity; // the more points reached the better
    let bestDistance = Infinity; // to sort the cases where the same number of points are reached
    let bestPath = null; // the best path found so far

    // now try find paths from depot to points, taking into account maximum distance
    for (const permutation of permutations) {
      const paths = []; // store the paths we find - >1 if the maximum distance is exceeded
      let totalDistance = 0; // total distance of all paths. Used to sort the results
      let distanceElapsed = 0; // distance of the current path

      let activePath: Array<[number, number]> = [[depotLon, depotLat]]; // path to build up - starts at depot
      let lastPosition = activePath[0];

      // iterate over each path in the permutation (path of [lon, lat])
      for (const predictedPath of permutation) {
        // find the interception point to the path from the last drone intercept
        const interceptPoint = this.getIntercept(
          lastPosition,
          distanceElapsed / droneSpeedDeg,
          droneSpeedDeg,
          predictedPath.speed,
          predictedPath.positions,
        );

        // if the point cannot be reached, move on to the next point
        if (typeof interceptPoint === 'undefined') {
          continue;
        }

        // distance from last point to the predicted point
        // if the distance to the point from the last point and then back to the depot
        // is too great, then return to the depot and start a new route
        const pointDistance = getDistance(lastPosition, interceptPoint, { units: 'degrees'});
        const distanceBackToDepot = getDistance(interceptPoint, [depotLon, depotLat], { units: 'degrees' });

        // if the distance + the distance back to depot exceeds max distance, return to depot and exclude point
        if (distanceElapsed + pointDistance + distanceBackToDepot > droneMaxFlightDistanceDeg) {
          // end this path
          activePath.push([depotLon, depotLat]);
          paths.push(activePath);
          // add the distance from the last feasible point back to the depot
          totalDistance += getDistance(lastPosition, [depotLon, depotLat], { units: 'degrees' });

          // create a new path
          // first we need to find the intercept from the depot to the new point at elapsed = 0
          const newInterceptPoint = this.getIntercept(
            [depotLon, depotLat],
            0,
            droneSpeedDeg,
            predictedPath.speed,
            predictedPath.positions,
          );

          // create the active path
          activePath = [[depotLon, depotLat], newInterceptPoint];
          // add the distance from the depot to the new intercept
          const distanceDepotToNewIntercept = getDistance([depotLon, depotLat], newInterceptPoint, { units: 'degrees' });
          lastPosition = newInterceptPoint;
          distanceElapsed = distanceDepotToNewIntercept;
          totalDistance += distanceDepotToNewIntercept;
        }
        // otherwise, add the intercept point
        else {
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

      const feasiblePaths = paths.filter(route => {
        if (route.length <= 2) {
          // if it's only depot to depot, don't count it
          return false;
        }

        const routeDistance = route.reduce((sum, point, index) => {
          if (index === route.length - 1) {
            return sum;
          }
          const pointDistance = getDistance(point, route[index + 1], { units: 'degrees' });
          return sum + pointDistance;
        }, 0);

        return routeDistance < droneMaxFlightDistanceDeg;
      });

      const numPointsReached = feasiblePaths.reduce((total, route) => {
        return total + route.length - 2; // - 2 to exclude depots
      }, 0);

      // if it visits more points, then it is better
      if (
        bestPath === null ||
        numPointsReached > bestPointsReached ||
        (numPointsReached === bestPointsReached && totalDistance < bestDistance)
      ) {
        bestPath = feasiblePaths;
        bestDistance = totalDistance;
        bestPointsReached = numPointsReached;
      }
    }

    return bestPath;
  }

  /**
   * Find the intercept between a line and the drone given a time offset
   * @param dronePosition 
   * @param timeElapsed 
   * @param droneSpeedDeg 
   * @param targetSpeedDeg 
   * @param targetPositions 
   */
  private getIntercept(dronePosition: [number, number], timeElapsed, droneSpeedDeg, targetSpeedDeg, targetPositions): [number, number] {
    const targetDistanceTravelled = timeElapsed * targetSpeedDeg;

    // first, account for the distance along the line the elephant has moved
    let offsetLine;
    try {
      offsetLine = lineSliceAlong(
        lineString(targetPositions),
        targetDistanceTravelled,
        Infinity,
        { units: 'degrees' },
      );
    } catch (err) {
      console.error('line error', err);
      return undefined;
    }

    const points: any[] = offsetLine.geometry.coordinates;

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
      To calculate the intercept, we treat the path the target goes on
      as multiple lines. Each of these lines is tested for an intersection
      point. If there is no intersection point, it tests the next line
      segment in the path.

      We find the intercept as follows:
      We know where the target line starting point is and what its direction
      is and its velocity.
      We also know where the drone starts and what its velocity is. We treat
      the area the drone can reach as a circle.
      We then find the intercept between the circle and the target's path.
    */
    
    let elapsedDistance = 0;
    for (const line of lines) {
      // get bearing of the line, where the x axis is 0 degrees
      const bearing = 90 - getBearing(line[0], line[1]);

      // gradient of the line = the gradient the target moves along
      const lineGradientVector = new Victor(
        Math.cos(bearing / 180 * Math.PI),
        Math.sin(bearing / 180 * Math.PI)
      );

      // calculate the target's movement vector ("gradient" * speed)
      const targetMovementVector = lineGradientVector.clone()
        .multiplyScalar(targetSpeedDeg); // velocity vector of target

      // target start at t = 0 is equal to the start of the line. However, if this is not
      // the first line segment being tested, we imagine that the line is longer to account
      // for the previous line segments. The line segment is made longer on the start end.
      const targetStartVector = lineGradientVector.clone().invert()
        .multiplyScalar(elapsedDistance);
      const targetStart = new Victor(line[0][0], line[0][1]).add(targetStartVector);

      // the starting points of the target and drone
      const droneStart = new Victor(dronePosition[0], dronePosition[1]); // starting drone position

      const a = targetMovementVector.clone().dot(targetMovementVector) - droneSpeedDeg * droneSpeedDeg;
      const b = 2 * targetStart.clone().subtract(droneStart).dot(targetMovementVector);
      const c = targetStart.clone().subtract(droneStart).dot(targetStart.clone().subtract(droneStart));

      // solve quadratic equation for a, b, c to find time
      const solutionA = solveQuadratic(a, b, c, 1);
      const solutionB = solveQuadratic(a, b, c, -1);

      // only positive solution is the correct one (time cannot be negative)
      const t = Math.max(solutionA, solutionB);
      // find the point along the line the target would be at for the found time
      const interception = targetStart.clone().add(targetMovementVector.clone().multiplyScalar(t));

      // check that the intercept point is actually on the line
      const lineDistance = getDistance(line[0], line[1], { units: 'degrees' });
      const interceptionDistance = getDistance(line[0], [interception.x, interception.y], { units: 'degrees' });

      elapsedDistance += lineDistance;

      // if the point isn't on the line, then try the next line segment
      if (interceptionDistance > lineDistance) {
        continue;
      }

      // if the point is on the line, then return the interception point
      return [interception.x, interception.y];
    }

    return undefined;
  }
}