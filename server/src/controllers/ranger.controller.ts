import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { RangerService } from '../services/ranger.service';

@Controller()
export class RangerController {
  constructor(private readonly rangerService: RangerService) {}


  /**
   * Adds a ranger to the system 
   * This is saved within the database 
   * @param lon Longtitude of the ranger 
   * @param lat Latitude of the ranger 
   * @param rangerID The user ID of the ranger that was used to register on the system
   * This function will return true if it executed successfully 
   */  
  @Post('addRanger')
  async addRanger(@Body() body) : Promise<boolean> {
    return await this.rangerService.addRanger(body.lon,body.lat,body.rangerID);
  }

  
  /**
   * Updates the location of a ranger within the system 
   * This is saved within the database 
   * @param lon Longtitude of the ranger 
   * @param lat Latitude of the ranger 
   * @param rangerID The user ID of the ranger that was used to register on the system
   * This function will return true if it executed successfully 
   */
  @Post('updateRangerLocation') 
  async updateRangerLocation(@Body() body ) : Promise<boolean> {
    return await this.rangerService.addRanger(body.lon,body.lat,body.rangerID);
  }

}
