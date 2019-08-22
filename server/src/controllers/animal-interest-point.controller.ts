import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AnimalInterestPointService } from '../services/animal-interest-point.service';
import { AuthGuard } from '@nestjs/passport';

import { AdminGuard } from '../auth/admin.guard';
@Controller()
export class AnimalInterestPointController {
  constructor(
    private readonly animalInterestPointService: AnimalInterestPointService,
  ) {}

  // @Get('addAnimalInterestPoint')
  // async addAnimalInterestPoint(): Promise<boolean> {
  //   return this.animalInterestPointService.addAnimalInterestPoint();
  // }
  @UseGuards(AuthGuard('jwt'))
  @Post('addAnimalInterestPoint')
  async addAnimalInterestPoint() :Promise <boolean> {
    return this.animalInterestPointService.addAnimalInterestPoint();
  }
}
