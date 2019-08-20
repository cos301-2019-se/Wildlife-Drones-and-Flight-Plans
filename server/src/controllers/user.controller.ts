import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { addUserDTO, updateUserDTO, deleteUserDTO } from '../dto/validation';
import { User } from 'src/entity/user.entity';
import { AdminGuard } from 'src/auth/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('getUsers')
  async getUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Post('loginPin')
  async loginUser(@Body() body): Promise<{
    status: boolean;
    message: string;
    token: string;
  }> {
    const loginPinResult = await this.userService.loginPin(
      body.email,
      body.password,
      body.otp,
    );

    const res = {
      status: loginPinResult.status,
      message: loginPinResult.message,
      token: null,
    };

    if (loginPinResult.status === true) {
      res.token = (await this.authService.createToken(body.email)).accessToken;
    }

    return res;
  }

  @Post('loginEmail')
  async loginUserEmail(@Body() body): Promise<boolean> {
    const status = await this.userService.loginEmail(body.email);
    if (status) {
      return true;
    }
  }

  @Post('resetPassword')
  async resetPass(@Body() body): Promise<boolean> {
    console.log("made it to the end point")
    return await this.userService.reset(body.email,body.otp);
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
    return await this.userService.deactivateUser(deleteUserDto.id);
  }

  @Post('vToken')
  async vToken(
    @Body() body,
  ): Promise<{
    jobType: string;
    status: boolean;
    token: string;
  }> {
    const valid = this.authService.validateToken(body.token);
    if (!valid) {
      return {
        jobType: null,
        status: false,
        token: body.token,
      };
    }

    const job = await this.userService.getJobType(body.email);
    return {
      jobType: job,
      status: true,
      token: (await this.authService.createToken(body.email)).accessToken,
    };
  }
}
