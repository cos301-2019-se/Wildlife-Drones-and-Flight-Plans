import { Injectable } from '@nestjs/common';
import { createConnection, Entity, Connection, Repository } from 'typeorm';
import { User } from '../entity/User';
import { Animal_locations } from '../entity/Animal_loactions';
import { Animal_intrest_point} from '../entity/animal_intrest_point';

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

       /*
        *for when using postgres
        *type: "postgres",
        *host: "localhost",
        *port: 5432,
        *username: "postgres",
        *password: "123ert",
        *database: "rietvlei_reserve",
      */

      this.connection = await createConnection({
        type: "sqlite",
        database: "database.sqlite",
        entities: [
            User
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