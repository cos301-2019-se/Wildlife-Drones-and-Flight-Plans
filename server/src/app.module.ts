import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {MapController} from './controllers/map.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, MapController],
  providers: [AppService],
})
export class AppModule {}
