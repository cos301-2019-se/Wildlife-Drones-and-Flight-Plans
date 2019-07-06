import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PoachingIncidentService } from '../services/poaching-incident.service';

@Controller()
export class PoachingIncidentController {
  constructor(
    private readonly poachingIncidentService: PoachingIncidentService,
  ) {}

  @Post('addIncident')
  async addPoachingIncident(@Body() body): Promise<boolean > {
    return await this.poachingIncidentService.addPoachingIncident(
      body.lon,
      body.lat,
      body.pType,
      body.description,
    );

  }
  


}