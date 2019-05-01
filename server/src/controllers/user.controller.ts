import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUsers')
  getAllUsers(): JSON {
    return this.userService.getAllUsers();
  }
  @Post('login')
  loginUser(): boolean {
    return this.userService.login("tedssaw@gmail.com", "Reddbull1" );
  }

  @Post('addUser')
  addUser(): boolean {
    return this.userService.addUser("Jannie","Balsak","Reddbull","Ranger", "tedssaw@gmail.com");
    //return //something
  }



}
