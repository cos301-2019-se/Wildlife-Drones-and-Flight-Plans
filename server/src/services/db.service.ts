import { Injectable } from '@nestjs/common';
import { createConnection, Connection } from 'typeorm';
import { User } from '../entity/user.entity';
import { AnimalLocation } from '../entity/animal-location.entity';
import { AnimalInterestPoint } from '../entity/animal-interest-point.entity';
import { Ranger } from '../entity/ranger.entity';
import { PoachingIncident } from '../entity/poaching-incident.entity';
import { PoachingIncidentType } from '../entity/poaching-incident-type.entity';
import { MapData } from '../entity/map-data.entity';
import { ModelData } from '../entity/model.entity';
import { Species } from '../entity/animal-species.entity';
import { Drone } from '../entity/drone.entity'
import { DroneRoute } from '../entity/drone-route.entity';
import { MapCellData } from '../entity/map-cell-data.entity';
import { AnimalCellWeight } from '../entity/animal-cell-weight.entity';
import { PoachingCellWeight } from '../entity/poaching-cell-weight.entity';
import { ConfigService } from './config.service';

@Injectable()
export class DatabaseService {
  private connection: Connection;
  private readyPromise: Promise<Connection> = null;

  constructor(
    private config: ConfigService,
  ) {}

  /**
   * Usage:
   * const users = (await new DatabaseService().getConnection()).getRepository(User);
   */
  getConnection(): Promise<Connection> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    const { db: dbConfig } = this.config.getConfig();

    this.readyPromise = new Promise(async resolve => {
      this.connection = await createConnection({
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.user,
        password: dbConfig.pass,
        database: dbConfig.database,

        entities: [
          User,
          AnimalLocation,
          AnimalInterestPoint,
          MapData,
          PoachingIncident,
          PoachingIncidentType,
          Ranger,
          ModelData,
          Species,
          Drone,
          DroneRoute,
          MapCellData,
          AnimalCellWeight,
          PoachingCellWeight,
        ],
        synchronize: true,
        logging: false,
      });

      resolve(this.connection);
    });

    return this.readyPromise;
  }
}
