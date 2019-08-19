import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { User } from '../entity/user.entity';
import { addUserDTO, updateUserDTO, deleteUserDTO } from '../dto/validation';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('getUsers')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  //@UseGuards(AuthGuard('jwt'))
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Post('loginPin')
  async loginUser(@Body() body): Promise<JSON> {
    const status = await this.userService.loginPin(body.email, body.password, body.otp);
    if (status) {
      console.log("Status " + status)
      return await this.authService.createToken(body.email);
    }
  }

  @Post('loginEmail')
  async loginUserEmail(@Body() body): Promise<boolean> {
    const status = await this.userService.loginEmail(body.email);
    if (status) {
      return true;
    }
  }


  //@UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('resetPassword')
  async resetPass(@Body() body): Promise<boolean> {
   return await this.userService.reset(body.email);
    console.log("it sees the endpoint")
    
  }

  @Post('resetPassq')
  async resetPassq(@Body() body): Promise<boolean> {
   return await this.userService.resetP(body.email,body.otp);
    console.log("it sees the endpoint")
    
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('addUser')
  async addUser(@Body() createUserDto: addUserDTO): Promise<boolean> {
    return await this.userService.addUser(
      createUserDto.name,
      createUserDto.email,
      createUserDto.password,
      createUserDto.job,
      createUserDto.surname,
    );
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('updateUser')
  async updateUser(@Body() updateUserDto: updateUserDTO): Promise<boolean> {
 //  return true;
 console.log(JSON.stringify(updateUserDto));
    return await this.userService.updateUser(
      updateUserDto.id,
      updateUserDto.name,
      updateUserDto.surname,
      updateUserDto.email,
      updateUserDto.job,
    );
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('deactivateUser')
  async deactivate(@Body() deleteUserDto: deleteUserDTO): Promise<boolean> {
 //  return true;
    return await this.userService.deactivateUser(
      deleteUserDto.id,
    );
  }

  @Post('vToken')
  async vToken(@Body() body): Promise<{
    jobType:string;
    status: boolean;
    token: string;
  }> {
    const valid = this.authService.validateToken(body.token);
    console.log('Token status of function vToken is:',valid);
    if (!valid) {
      return {
        jobType:null,
        status: false,
        token: body.token,
      }
    }

    const job = await this.userService.getJobType(body.email);
    console.log('The job is',job);
    return {
      jobType:job,
      status: true,
      token: body.token,
    };
  }
}
