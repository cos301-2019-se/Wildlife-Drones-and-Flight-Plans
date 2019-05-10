import { Injectable } from '@nestjs/common';
import { createConnection, Entity, Connection, Repository } from 'typeorm';
import { User } from '../entity/user';
import { Animal_locations } from '../entity/animal-loaction';
import { AnimalInterestPoint} from '../entity/animal-interest-point';

@Injectable()
export class DatabaseService {
  private connection: Connection;
  private readyListeners = [];
  private isInitialising = false;

  /**
   * Usage: 
   * const users = (await new DatabaseService().getConnection()).getRepository(User);
   */
  getConnection(): Promise<Connection> {
    return new Promise(async resolve => {
      if (this.connection) return resolve(this.connection);

      this.readyListeners.push(resolve);
      if (this.isInitialising) {
        return;
      }
      this.isInitialising = true;

      this.connection = await createConnection({
        type: "sqlite",
        database: "database.sqlite",
        entities: [
            User,
            Animal_locations,
            AnimalInterestPoint
        ],
        synchronize: true,
        logging: false    
      });

      while (this.readyListeners.length) {
        this.readyListeners[0](this.connection);
        this.readyListeners.shift();
      }
    });
  }
}