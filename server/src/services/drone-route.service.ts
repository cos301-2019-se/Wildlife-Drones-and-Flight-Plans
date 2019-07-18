/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { DroneRoute } from '../entity/drone-route.entity';
import { Drone } from '../entity/drone.entity';

@Injectable()
export class DroneRouteService {
  constructor(private readonly databaseService: DatabaseService) {}

  // add drone route to Drone route table in database
  async addDroneRoute(id: number, points: string): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = new DroneRoute();

    let droneIdfromDroneTable = await con
      .getRepository(Drone)
      .findOne({ id: id });

    if ((droneIdfromDroneTable) == undefined) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      droneRoute.drone = droneIdfromDroneTable;
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

  async updateDroneRoute(
    id: number,
    points: string,
    percent: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = await con.getRepository(DroneRoute).findOne({ id: id });

    if ((droneRoute) == undefined) {
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

  async deactivateDroneRoute(id: number): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const droneRoute = await con.getRepository(DroneRoute).findOne({ id: id });

    if (droneRoute == undefined) {
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
}
