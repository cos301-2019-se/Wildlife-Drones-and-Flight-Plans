/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Ranger } from '../entity/ranger.entity';
import { User } from '../entity/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class RangerService {
  constructor(private readonly databaseService: DatabaseService) {}

  async addRanger(
    lon: number,
    lat: number,
    rangerID: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const ranger = new Ranger();

    try {
      let rangerUser = await con
        .getRepository(User)
        .findOne({ id: rangerID, jobType: 'ranger' });

      if (rangerUser != undefined) {
        ranger.time = new Date();
        ranger.longitude = lon;
        ranger.latitude = lat;
        ranger.ranger = rangerUser;
        // tslint:disable-next-line:no-console
        const addedRanger = await con.getRepository(Ranger).save(ranger);
        console.log(
          'Saved new ranger with id: ' +
            ranger.id +
            ' and rangerid: ' +
            ranger.ranger,
        );
        return addedRanger != null;
      }
      console.log("dit wrk nie");
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateRangerLocation(
    lon: number,
    lat: number,
    rangerID: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();

    try {
      let rangerUser = await con
        .getRepository(User)
        .findOne({ id: rangerID, jobType: 'ranger' });
      let updateRanger = await con
        .getRepository(Ranger)
        .findOne({ ranger: rangerUser });

      updateRanger.time = new Date();
      updateRanger.longitude = lon;
      updateRanger.latitude = lat;

      // tslint:disable-next-line:no-console
      const updatedRanger = await con.getRepository(Ranger).save(updateRanger);
      console.log(
        'Updated loaction of ranger with id: ' +
          updateRanger.id +
          ' and rangerid: ' +
          rangerUser.id,
      );
      return updatedRanger != null;
    } catch (error) {
      console.log('ranger not found');
      return false;
    }
  }
}
