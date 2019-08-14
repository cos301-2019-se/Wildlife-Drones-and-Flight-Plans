/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Drone } from '../entity/drone.entity';
import { DroneRoute } from '../entity/drone-route.entity';

@Injectable()
export class DroneService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * adds drone, with given parameters
   * @param name 
   * @param avgSpeed 
   * @param avgFlightTime 
   * @param speed 
   * @param flightTime 
   * @param lon 
   * @param lat 
   */
  async addDrone(
    name: string,
    avgSpeed: number,
    avgFlightTime: number,
    speed: number,
    flightTime: number,
    lon: number,
    lat: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = new Drone();

    try {
      drone.name = name;
      drone.avgSpeed = avgSpeed;
      drone.avgFlightTime = avgFlightTime;
      drone.speed = speed;
      drone.flightTime = flightTime;
      drone.longitude = lon;
      drone.latitude = lat;
      drone.active = true;
      // tslint:disable-next-line:no-console
      const addedDrone = await con.getRepository(Drone).save(drone);
      console.log('Saved a new drone with id: ' + drone.id);
      return addedDrone != null;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * updates drone information with given id, not all parameters needed
   * @param id 
   * @param name 
   * @param avgSpeed 
   * @param avgFlightTime 
   * @param speed 
   * @param flightTime 
   * @param lon 
   * @param lat 
   */
  async updateInfo(
    id: number,
    name: string,
    avgSpeed: number,
    avgFlightTime: number,
    speed: number,
    flightTime: number,
    lon: number,
    lat: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = await con.getRepository(Drone).findOne({ id: id });

    if (drone == undefined) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      drone.name = name;
      drone.avgSpeed = avgSpeed;
      drone.avgFlightTime = avgFlightTime;
      drone.speed = speed;
      drone.flightTime = flightTime;
      drone.longitude = lon;
      drone.latitude = lat;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(Drone).save(drone);
      console.log('Drone was updated with id: ' + drone.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('Drone was not updated');
      return false;
    }
  }

  async updateDrones(drones: Drone[]): Promise<boolean> {
    const conn = await this.databaseService.getConnection();
    const repo = conn.getRepository(Drone);

    try {
      await repo.save(drones);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }

  /**
   * 
   * @param id deactivates drone with given id
   */
  async deactivateDrone(id: number): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = await con.getRepository(Drone).findOne({ id: id });

    if (drone == undefined) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      drone.active = false;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(Drone).save(drone);
      console.log('Drone was deactivated with id: ' + drone.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('Drone was not deactivated');
      return false;
    }
  }

  /**
   * Returns a single drone for the given id
   * @param droneId
   */
  async getDrone(droneId: number) {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(Drone);

    return await rep.findOne({
      where: {
        id: droneId,
        active: true,
      }
    });
  }

  /**
   * Returns drones that are active
   * @param activeOnly 
   */
  async getDrones(activeOnly = true): Promise<Drone[]> {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(Drone);

    if (activeOnly) {
      return await rep.find({
        where: {
          active: true,
        }
      });
    }

    return await rep.find();
  }

  /**
   * adds drone route, with given information 
   * @param id 
   * @param points 
   */
  async addDroneRoute(id: number, points: string): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = new DroneRoute();

    let droneIdFromDroneTable = await con
      .getRepository(Drone)
      .findOne({ id: id });

    if (!droneIdFromDroneTable) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      droneRoute.drone = droneIdFromDroneTable;
      droneRoute.points = points;
      droneRoute.percentComplete = 0;
      droneRoute.timestamp = new Date();
      droneRoute.active = true;
      // tslint:disable-next-line:no-console
      const addedDroneRoute = await con
        .getRepository(DroneRoute)
        .save(droneRoute);
      console.log('Saved a new drone route with id: ' + droneRoute.id);
      return addedDroneRoute != null;
    } catch (error) {
      console.log('Drone route was not saved');
      console.log(error);
      return false;
    }
  }

  /**
   * updates drone route given an id, does not require all parameters
   * @param id 
   * @param points 
   * @param percent 
   */
  async updateDroneRoute(
    id: number,
    points: string,
    percent: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = await con.getRepository(DroneRoute).findOne({ id: id });

    if (!droneRoute) {
      console.log('Drone route' + id + ' was not found');
      return false;
    }

    try {
      droneRoute.points = points;
      droneRoute.percentComplete = percent;
      // tslint:disable-next-line:no-console
      const updatedDroneRoute = await con
        .getRepository(DroneRoute)
        .save(droneRoute);
      console.log('Drone route was updated with id: ' + droneRoute.id);
      return updatedDroneRoute != null;
    } catch (error) {
      console.log('Drone route was not updated');
      return false;
    }
  }

  /**
   * deactivates drone route with given id
   * @param id 
   */
  async deactivateDroneRoute(id: number): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = await con.getRepository(DroneRoute).findOne({ id: id });

    if (!droneRoute) {
      console.log('Drone route ' + id + ' was not found');
      return false;
    }

    try {
      droneRoute.active = false;
      // tslint:disable-next-line:no-console
      const updatedDroneRoute = await con
        .getRepository(DroneRoute)
        .save(droneRoute);
      console.log('Drone route was deactivated with id: ' + droneRoute.id);
      return updatedDroneRoute != null;
    } catch (error) {
      console.log('Drone route was not deactivated');
      return false;
    }
  }

  /**
   * returns all drone routes information
   */
  async getDroneRoutes(): Promise<DroneRoute[]> {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(DroneRoute);

    return await rep.find();
  }
}
