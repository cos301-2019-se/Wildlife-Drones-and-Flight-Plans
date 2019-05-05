import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MapController} from './controllers/map.controller';
import { MapUpdaterService } from './providers/map-updater.service';
import { ShortestPathService } from './providers/shortest-path.service';
import { UserController } from './controllers/user.controller';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';

@Module({
  imports: [],
  controllers: [MapController, UserController],
  providers: [MapUpdaterService, ShortestPathService, DatabaseService, UserService],
})
export class AppModule {}
