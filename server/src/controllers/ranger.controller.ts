import { Controller, Get, Query } from '@nestjs/common';
import { RangerService } from '../services/ranger.service';

@Controller()
export class RangerController {
  constructor(private readonly rangerServie: RangerService) {}

  @Get('addRanger')
  addRanger(
    @Query('long') long: number,
    @Query('lat') lat: number,
    @Query('rangerID') rangerID: number,
  ): Promise<boolean> {
    return this.rangerServie.addRanger(long, lat, rangerID);
  }

  @Get('updateRangerLocation')
  updateRangerLocation(
    @Query('long') long: number,
    @Query('lat') lat: number,
    @Query('rangerID') rangerID: number,
  ): Promise<boolean> {
    return this.rangerServie.updateRangerLocation(long, lat, rangerID);
  }
}
