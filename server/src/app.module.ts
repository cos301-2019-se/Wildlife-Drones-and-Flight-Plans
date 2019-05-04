import { Module } from '@nestjs/common';

//import { AppController } from './app.controller';
import {MapController} from './controllers/map.controller';
//import { AppService } from './app.service';
import { MapUpdaterService } from './providers/map-updater.service';
import { ShortestPathService } from './providers/shortest-path.service'; 
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [],
  controllers: [MapController,UserController],
  providers: [MapUpdaterService, ShortestPathService,DatabaseService,UserService],

})
export class AppModule {}
