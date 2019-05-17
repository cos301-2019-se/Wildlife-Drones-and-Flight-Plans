import { Controller, Get, Post, Body,UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
    ) {}

  @Get('token')
  async createToken(): Promise<any> {
    return await this.authService.createToken();
  }


  @Get('getUsers')
  @UseGuards(AuthGuard('jwt'))
  getAllUsers(): JSON {
    return this.userService.getAllUsers();
  }


  @Post('login')
  async loginUser(@Body() _body):Promise< JSON>{
  let status = await this.userService.login(_body.email,_body.password);
    console.log(status);
      if (status == false)
      {

      }
      else{
        return await this.authService.createToken();
      }
  
       
      
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
    return this.userService.vToken(_body.email,_body.token);
  }

}
