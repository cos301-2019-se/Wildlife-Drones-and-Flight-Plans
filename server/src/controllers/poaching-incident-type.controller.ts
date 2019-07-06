import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PoachingIncidentTypeService } from '../services/poaching-incident-type.service';

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
}