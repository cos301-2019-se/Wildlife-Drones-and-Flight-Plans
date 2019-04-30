import { Controller, Get } from '@nestjs/common';
import { UserService } from 'src/services/user.service';

@Controller()
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
