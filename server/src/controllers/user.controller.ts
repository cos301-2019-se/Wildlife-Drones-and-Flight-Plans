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
  loginUser(@Body() _body): boolean {
    //var email =  
    // console.log();
   // var temp1 =@Body(email);

   console.log(_body.email);
   console.log(_body.password);
    return this.userService.login(_body.email,_body.password);
  }

  @Post('addUser')
  addUser(@Body() _body): boolean {



    return this.userService.addUser(_body.name,_body.username,_body.password,_body.job,_body.email);
    //return //something
  }

@Post('vToken')
  vToken(@Body() _body): boolean {
    //var email =  
    // console.log();
   // var temp1 =@Body(email);

   //console.log(_body.email);
   //console.log(_body.password);
    return this.userService.vToken(_body.Email,_body.token);
  }

}
