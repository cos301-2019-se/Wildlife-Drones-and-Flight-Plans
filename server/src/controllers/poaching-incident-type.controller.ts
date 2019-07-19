import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { PoachingIncidentTypeService } from '../services/poaching-incident-type.service';
import { AuthGuard } from '@nestjs/passport';
import { PoachingIncidentType } from '../entity/poaching-incident-type.entity';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class PoachingIncidentTypeController {
  constructor(
    private readonly poachingIncidentTypeService: PoachingIncidentTypeService,
  ) {}

  @Post('addPoachingIncidentType')
  async addPoachingIncidentType(@Body() body): Promise<boolean> {
    return await this.poachingIncidentTypeService.addPoachingIncidentType(
      body.poachingType,
    );
  }

  @Post('getPoachingIncidentTypes')
  async getPoachingIncidentTypes(): Promise<PoachingIncidentType[]> {
    return await this.poachingIncidentTypeService.getPoachingIncidentTypes();
  }
}
