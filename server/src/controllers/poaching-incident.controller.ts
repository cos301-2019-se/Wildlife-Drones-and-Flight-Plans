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

  @Post('addIncident')
  async addPoachingIncident(@Body() body): Promise<boolean > {
    return await this.poachingIncidentService.addPoachingIncident(
      body.lon,
      body.lat,
      body.pType,
      body.description,
    );

  }

  @Post('getIncidents')
  async getPoachingIncidents(): Promise<PoachingIncident[]> {
    return await this.poachingIncidentService.getPoachingIncidents();
  }

}