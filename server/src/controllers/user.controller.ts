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
    return this.userService.login("tedsaw@gmail.com","123ert");
  }

  @Post('addUser')
  addUser(): boolean {
    return this.userService.addUser("Jannie","Balsak","koostieties","Ranger", "tedsaw@gmail.com");
    //return //something
  }



}
