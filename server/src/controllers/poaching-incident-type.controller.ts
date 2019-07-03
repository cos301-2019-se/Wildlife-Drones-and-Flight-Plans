import { Controller, Get, Query } from '@nestjs/common';
import { PoachingIncidentTypeService } from '../services/poaching-incident-type.service';

@Controller()
export class PoachingIncidentTypeController {
  constructor(
    private readonly poachingIncidentTypeService: PoachingIncidentTypeService,
  ) {}

  @Get('addPoachingIncidentType')
  addPoachingIncidentType(
    @Query('poachingType') poachingType: string,
  ): Promise<boolean> {
    return this.poachingIncidentTypeService.addPoachingIncidentType(
      poachingType,
    );
  }
}
