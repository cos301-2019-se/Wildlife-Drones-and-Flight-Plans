import { Module } from '@nestjs/common';
import { DatabaseService } from './services/db.service';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [],
  controllers: [ UserController],
  providers: [ DatabaseService, UserService],
})
export class AppModule {}
