import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PoachingIncidentTypeService } from '../services/poaching-incident-type.service';

@Controller()
export class PoachingIncidentTypeController {
  constructor(
    private readonly poachingIncidentTypeService: PoachingIncidentTypeService,
  ) {}

  // @Get('addPoachingIncidentType')
  // async addPoachingIncidentType(
  //   @Query('poachingType') poachingType: string,
  // ): Promise<boolean> {
  //   return this.poachingIncidentTypeService.addPoachingIncidentType(
  //     poachingType,
  //   );
  // }
    @Post('addPoachingIncidentType')
    async addPoachingIncidentType(@Body() body): Promise<boolean> {
      return await this.poachingIncidentTypeService.addPoachingIncidentType(
        body.poachingType,
    
      
    );
}
}
