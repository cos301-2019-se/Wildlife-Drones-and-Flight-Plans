import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MapController} from './controllers/map.controller';
import { AppService } from './app.service';
import { MapUpdaterService } from './providers/map-updater.service';
import { ShortestPathService } from './providers/shortest-path.service';

@Module({
  imports: [],
  controllers: [AppController, MapController],
  providers: [AppService, MapUpdaterService, ShortestPathService],
})
export class AppModule {}
