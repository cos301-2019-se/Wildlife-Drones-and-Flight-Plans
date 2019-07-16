import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { PoachingIncidentTypeService } from '../services/poaching-incident-type.service';
import { AuthGuard } from '@nestjs/passport';
import { PoachingIncidentType } from 'src/entity/poaching-incident-type.entity';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class PoachingIncidentTypeController {
  constructor(
    private readonly poachingIncidentTypeService: PoachingIncidentTypeService,
  ) {}

  /**
   * Adds a poaching incident type to the system 
   * For example a snare or a gunshot etc.
   * This is saved within the database 
   * @param poachingType The type of poaching incident being added 
   */

  @Post('addPoachingIncidentType')
  async addPoachingIncidentType(@Body() body): Promise<boolean> {
    return await this.poachingIncidentTypeService.addPoachingIncidentType(
      body.poachingType,
    );
  }

  /**
   * Retrieves the different types of incidents that are recorded on the ssystem 
   * This information is retrieved from the database
   */
  
  @Post('getPoachingIncidentTypes')
  async getPoachingIncidentTypes(): Promise<PoachingIncidentType[]> {
    return await this.poachingIncidentTypeService.getPoachingIncidentTypes();
  }
}
