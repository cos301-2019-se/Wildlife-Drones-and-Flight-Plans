import { Controller, Get, Query, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DroneService } from '../services/drone.service';
import { Drone } from '../entity/drone.entity';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { DroneRoute } from '../entity/drone-route.entity';
import { MailService } from '../services/mail.service';
import { options } from 'superagent';
import { AuthService } from '../auth/auth.service';
import { controllers } from '../app.controllers';
import { MapService } from '../services/map.service'

@UseGuards(AuthGuard('jwt'))
@Controller()
export class DroneController {
  constructor(private readonly droneService: DroneService,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
    private readonly mapService: MapService, ) { }

  @Post('addDrone')
  async addDrone(@Body() body): Promise<boolean> {
    return await this.droneService.addDrone(
      body.name,
      body.avgSpeed,
      body.avgFlightTime,
      body.speed,
      body.flightTime,
      body.lon,
      body.lat,
    );
  }

  @Post('updateDronePosition')
  async updateDrone(@Body() body): Promise<boolean> {
    return await this.droneService.updateDronePosition(
      body.droneId,
      body.longitude,
      body.latitude,
    );
  }

  @Post('deactivateDrone')
  async deactivateDrone(@Body() body): Promise<boolean> {
    return await this.droneService.deactivateDrone(body.id);
  }

  @Post('getDrones')
  async getDrones(): Promise<Drone[]> {
    return await this.droneService.getDrones();
  }

  @Post('updateDrones')
  async updateDrones(@Body() body: { drones: Drone[] }): Promise<boolean> {
    return await this.droneService.updateDrones(body.drones);
  }

  /**
   * Called when the user selects a drone route. Saves the route to the
   * database and sends the route to the user's email for mission planner.
   * @param body
   * @param req
   */
  @Post('selectDroneRoute')
  async selectDroneRoute(@Body() body, @Request() req): Promise<boolean> {
    const user = req.user;

    const res = await this.droneService.selectDroneRoute(body.droneId, body.points);
    console.log('The info extracted from the request  ', user);

    const droneT = await this.droneService.getDrone(body.droneId);

    if (!res) {
      return false;
    }

    this.mapService.updateCellLastVisited(body.points);
    const tokenT = await this.authService.createToken(user.email);


    const cArray = {
      droneId: body.droneId,
      token: tokenT.accessToken,
      points: body.points,
      droneSpeed: droneT.avgSpeed,
    };

    console.log('The drone array ', cArray)
    const encodedString = Buffer.from(JSON.stringify(cArray)).toString('base64')

    await this.mailService.send({
      subject: `You route is ready`,
      template: 'route.twig',
      templateParams: {
        routeString: encodedString,
      },
      to: user.email,
    });
    return true;
  }

  @Post('updateDroneRoute')
  async updateDroneRoute(@Body() body): Promise<boolean> {
    return await this.droneService.updateDroneRoute(
      body.id,
      body.points,
      body.percent,
    );
  }

  @Post('deactivateDroneRoute')
  async deactivateDroneRoute(@Body() body): Promise<boolean> {
    return await this.droneService.deactivateDroneRoute(body.id);
  }

  @Post('getDroneRoutes')
  async getDroneRoutes(): Promise<DroneRoute[]> {
    return await this.droneService.getDroneRoutes();
  }
}
