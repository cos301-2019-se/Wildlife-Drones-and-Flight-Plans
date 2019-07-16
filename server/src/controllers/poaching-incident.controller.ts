import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { PoachingIncidentService } from '../services/poaching-incident.service';
import { PoachingIncident } from 'src/entity/poaching-incident.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class PoachingIncidentController {
  constructor(
    private readonly poachingIncidentService: PoachingIncidentService,
  ) {}


  /**
   * Adds a poaching incident to the system 
   * This is saved within the database 
   * @param pType The type of poaching incident being added 
   * @param lon The longtitude coordinate of the incident 
   * @param lat The latitude coordinate of the incident 
   * @param description A Description of the incident that took place
   */
  
  @Post('addIncident')
  async addPoachingIncident(@Body() body): Promise<boolean > {
    return await this.poachingIncidentService.addPoachingIncident(
      body.lon,
      body.lat,
      body.pType,
      body.description,
    );

  }

  /**
   * Retrieves all incidents recorded from the system
   * This information is then returned as an array of incidents
   */
  
  @Post('getIncidents')
  async getPoachingIncidents(): Promise<PoachingIncident[]> {
    return await this.poachingIncidentService.getPoachingIncidents();
  }

}
