import { Controller, Get, Query } from '@nestjs/common';
import { PoachingIncidentService } from '../services/poaching-incident.service';

@Controller()
export class PoachingIncidentController {
  constructor(
    private readonly poachingIncidentService: PoachingIncidentService,
  ) {}

  @Get('addPoachingIncident')
  addPoachingIncident(
    @Query('long') long: number,
    @Query('lat') lat: number,
    @Query('ptype') pType: string,
  ): Promise<boolean> {
    return this.poachingIncidentService.addPoachingIncident(long, lat, pType);
  }
}
