import getDistance from '@turf/distance';
/**
 * Weights used for heuristics in the Clarke Wright algorithm
 */
export interface CWWeights {
  adjacency: number;
  asymmetry: number;
  demand: number;
  minSavings: number;
}

/**
 * A Clarke Wright algorithm point
 */
export class Point {
  x: number;
  y: number;
  demand: number;

  /**
   * Instantiates a point
   * @param x The x position of the point
   * @param y The y position of the point
   * @param demand The demand/priority of the point - higher means more demand
   */
  constructor(x, y, demand) {
    this.x = x;
    this.y = y;
    this.demand = demand;
  }

  /**
   * Calculates the euclidean distance between two points
   * @param point
   */
  getDistanceTo(point: Point): number {
    return getDistance([point.x, point.y], [this.x, this.y], { units: 'degrees' });
  }
}

/**
 * Clarke Wright route
 */
class Route {
  static id = 0;
  points: Point[]; // list of points excluding the depot
  depot: Point; // the depot

  id: number;

  constructor(a: Point, depot: Point) {
    this.points = [a];
    this.depot = depot;
    this.id = Route.id++;
  }

  public getStart(): Point {
    return this.points[0];
  }
  public getEnd(): Point {
    return this.points[this.points.length - 1];
  }

  public joinRoute(route: Route) {
    this.points.push(...route.points);
  }

  /**
   * Cost from the depot through the points and back to the depot
   */
  public totalDistance(): number {
    let prev = this.depot;
    let cost = 0;

    this.points.forEach(point => {
      cost += prev.getDistanceTo(point);
      prev = point;
    });

    cost += prev.getDistanceTo(this.depot);

    return cost;
  }

  /**
   * Total demand of all the points
   */
  public totalDemand() {
    return this.points.reduce((sum, point) => sum + point.demand, 0);
  }
}

/**
 * Represents savings between two routes
 */
interface Savings {
  savings: number;
  routeA: Route;
  routeB: Route;
}

/**
 * Clarke Wright Vehicle Routing Problem solver
 * Uses an altered version of the classic CW heuristric with
 * additional heuristics:
 * - adjacency - how close points are to each other
 * - symmetry - measure of whether points are on the same side of the depot
 * - demand - how above demand the points are vs the rest of the points
 */
export class ClarkeWrightProblem {
  private solutions: Route[];
  private savings: Savings[] = [];
  private joinedRoutes: {[id: number]: boolean} = {};
  private averageDemand: number;
  private maxDemand: number;
  private maxPointDistance: number;

  /**
   * Constructs a Clarke Wright prolem with the given data points
   * @param points List of points to visit
   * @param depot Depot location
   * @param maxDistance Maximum distance the vehicle can travel. Must be in the same unit as x, y
   */
  constructor(
    private points: Point[],
    private depot: Point,
    private maxDistance: number,
  ) {
    this.maxPointDistance = -Infinity;
    for (const point of this.points) {
      for (const otherPoint of this.points) {
        const distance = point.getDistanceTo(otherPoint);
        if (distance > this.maxPointDistance) {
          this.maxPointDistance = distance;
        }
      }
    }

    this.averageDemand = this.points.reduce((sum, point) => sum + point.demand, 0) / this.points.length;
    this.maxDemand = this.points.reduce((max, point) => max < point.demand ? point.demand : max, -Infinity);
  }

  /**
   * Solves the problem, returning a list of possible routes sorted in order
   * of best demand.
   * adjacency = how important adjacent vertices are - 0.1 to 2
   * asymmetry = how much asymmetry between customers matters - 0 to 2
   * demand = how much the demand matters - 0 to 2
   * @param weights
   */
  public solve(weights: CWWeights) {
    // first, create one route per point
    this.solutions = this.points.map(point => new Route(point, this.depot));
    this.findAllRouteSavingsPairs(weights); // calculate savings

    while (this.savings.length) {
      for (const savings of this.savings) {
        const { routeA, routeB } = savings;

        // if neither route has been joined, join them
        if (!this.joinedRoutes[routeA.id] && !this.joinedRoutes[routeB.id]) {
          this.joinRoutes(routeA, routeB);
        } else if (!this.joinedRoutes[routeA.id]) {
          if (this.solutions.length && this.solutions[0].getStart() === routeB.getStart()) {
            this.joinRoutes(routeA, this.solutions[0]);
          }
        } else if (!this.joinedRoutes[routeB.id]) {
          if (this.solutions.length && this.solutions[0].getEnd() === routeA.getEnd()) {
            this.joinRoutes(this.solutions[0], routeB);
          }
        }
      }

      this.joinedRoutes = {}; // clear joined routes
      this.findAllRouteSavingsPairs(weights); // recalculate savings
    }

    // sort the routes by their demand served
    return this.solutions
      .filter(route => route.totalDistance() < this.maxDistance) // some routes might be too long for outlier points
      .sort((a, b) => b.totalDemand() / b.totalDistance() - a.totalDemand() / a.totalDistance());
  }

  /**
   * Calculates savings for all routes and sorts them in descending order
   */
  private findAllRouteSavingsPairs(weights: CWWeights) {
    this.savings = this.solutions.reduce((arr, route) => {
      this.solutions.forEach(otherRoute => {
        // if they're the same route they can't be a pair
        if (otherRoute === route) {
          return;
        }

        // find the savings between the start of one route and the end of the other
        const savingsAB = this.calculateSavings(route, otherRoute, weights);
        const savingsBA = this.calculateSavings(otherRoute, route, weights);

        // we want to use the greatest savings
        const a = savingsAB > savingsBA ? route : otherRoute;
        const b = (a === route ? otherRoute : route);
        const savings = Math.max(savingsAB, savingsBA);

        if (savings < weights.minSavings) {
          return;
        }

        // if the route is feasible (doesn't exceed the maximum distance), add it to the savings list
        if (this.verifyRouteJoin(a, b)) {
          arr.push({
            routeA: a,
            routeB: b,
            savings,
          });
        }
      });
      return arr;
    }, [])
    .sort((a, b) => b.savings - a.savings); // sort the savings in descending order
  }

  /**
   * Calculate the savings between two routes.
   * Uses the end of routeA and the start of routeB
   * @param routeA
   * @param routeB
   */
  private calculateSavings(routeA: Route, routeB: Route, weights): number {
    const customerA = routeA.getEnd();
    const customerB = routeB.getStart();

    const distDA = this.depot.getDistanceTo(customerA); // depot to A
    const distDB = this.depot.getDistanceTo(customerB); // depot to B

    const distAB = customerA.getDistanceTo(customerB); // A to B

    // adjacency measure = cost of going depot -> A -> B -> depot
    // vs depot -> A -> depot -> B -> depot
    const savingsAdjacency = (distDA + distDB - weights.adjacency * distAB) / this.maxPointDistance;

    // asymmetry measure = distance between two customers vs their angle through the depot
    const savingsAsymmetry = weights.asymmetry * (
        this.angle(customerA, this.depot, customerB) *
        Math.abs(this.maxPointDistance - (distDA - distDB) / 2)
      ) / this.maxPointDistance;

    // the average demand of the two points vs the average demand of all points
    const savingsDemand = weights.demand * Math.abs((this.averageDemand - (customerA.demand + customerB.demand) / 2)) / this.maxDemand;

    return savingsAdjacency + savingsAsymmetry + savingsDemand;
  }

  /**
   * Join two routes together
   * @param routeA
   * @param routeB
   */
  private joinRoutes(routeA: Route, routeB: Route): boolean {
    if (!this.verifyRouteJoin(routeA, routeB)) {
      // if the routes can't be joined because they would exceed the maximum
      // distance, return
      return false;
    }

    // join the routes
    routeA.joinRoute(routeB);

    // indicate that the routes have been joined
    this.joinedRoutes[routeA.id] = true;
    this.joinedRoutes[routeB.id] = true;

    // remove route B from the routes
    this.solutions.splice(this.solutions.indexOf(routeB), 1);
    return true;
  }

  /**
   * Determines whether the total length of the route would
   * exceed the maximum distance that can be travelled
   * @param routeA
   * @param routeB
   */
  private verifyRouteJoin(routeA: Route, routeB: Route) {
    const distance = routeA.totalDistance() - // total of A
      routeA.getEnd().getDistanceTo(this.depot) + // minus end of A to depot
      routeA.getEnd().getDistanceTo(routeB.getStart()) + // end of A and start of B
      routeB.totalDistance() - // total of B
      routeB.getStart().getDistanceTo(this.depot); // minus depot to start of B

    return distance < this.maxDistance;
  }

  /**
   * Calculates cos of the angle between p0 and p2 through p1
   * @param p0
   * @param p1
   * @param p2
   */
  private angle(p0: Point, p1: Point, p2: Point): number {
    const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
    const b = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);

    return Math.cos(Math.acos((a + b - c) / Math.sqrt(4 * a * b)));
  }
}