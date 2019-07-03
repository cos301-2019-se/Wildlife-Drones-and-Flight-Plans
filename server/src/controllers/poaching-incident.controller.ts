import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PoachingIncidentService } from '../services/poaching-incident.service';

@Controller()
export class PoachingIncidentController {
  constructor(
    private readonly poachingIncidentService: PoachingIncidentService,
  ) {}

  // @Get('addPoachingIncident')
  // async addPoachingIncident(
  //   @Query('long') long: number,
  //   @Query('lat') lat: number,
  //   @Query('ptype') pType: string,
  // ): Promise<boolean> {
  //   return this.poachingIncidentService.addPoachingIncident(long, lat, pType);
  // }
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
