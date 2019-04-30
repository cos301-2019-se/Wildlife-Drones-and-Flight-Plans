import { Injectable } from '@nestjs/common';
import { createConnection } from 'typeorm';
import { User } from 'src/entity/User';

@Injectable()
export class DatabaseService {
  async getConnection() {
    return await createConnection({
        type: "sqlite",
        database: "database.sqlite",
        entities: [
            User
        ],
        synchronize: true,
        logging: false    
    })
  }
}
