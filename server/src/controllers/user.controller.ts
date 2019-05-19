import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUsers')
  getAllUsers(): JSON {
    return this.userService.getAllUsers();
  }
  @Post('login')
  loginUser(@Body() body): JSON {
    // var email =
    // console.log();
   // var temp1 =@Body(email);
   return this.userService.login(body.email, body.password);
  }

  @Post('addUser')
  addUser(@Body() body): boolean {



    return this.userService.addUser(body.name, body.username, body.password, body.job, body.email);
    // return //something
  }

@Post('vToken')
  vToken(@Body() body): boolean {
    // var email =
    // console.log();
   // var temp1 =@Body(email);

   // console.log(body.email);
   // console.log(body.password);
    return this.userService.vToken(body.email, body.token);
  }

}
