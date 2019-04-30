import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, DatabaseService, UserService],
})
export class AppModule {}
