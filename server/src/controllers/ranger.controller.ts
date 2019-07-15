import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { RangerService } from '../services/ranger.service';

@Controller()
export class RangerController {
  constructor(private readonly rangerService: RangerService) {}

  // @Get('addRanger')
  // addRanger(
  //   @Query('lon') long: number,
  //   @Query('lat') lat: number,
  //   @Query('rangerID') rangerID: number,
  // ): Promise<boolean> {
  //   return this.rangerServie.addRanger(long, lat, rangerID);
  // }

  @Post('addRanger')
  async addRanger(@Body() body) : Promise<boolean> {
    return await this.rangerService.addRanger(body.lon,body.lat,body.rangerID);
  }

  // @Get('updateRangerLocation')
  // updateRangerLocation(
  //   @Query('lon') long: number,
  //   @Query('lat') lat: number,
  //   @Query('rangerID') rangerID: number,
  // ): Promise<boolean> {
  //   return this.rangerServie.updateRangerLocation(long, lat, rangerID);
  // }

  @Post('updateRangerLocation') 
  async updateRangerLocation(@Body() body ) : Promise<boolean> {
    return await this.rangerService.addRanger(body.lon,body.lat,body.rangerID);
  }

}
