import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { User } from 'src/entity/user.entity';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('getUsers')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Post('login')
  async loginUser(@Body() body): Promise<JSON> {
    const status = await this.userService.login(body.email, body.password);
    if (status) {
      return await this.authService.createToken(body.email);
    }
  }

  @Post('addUser')
  async addUser(@Body() body): Promise<boolean> {
    return await this.userService.addUser(
      body.name,
      body.email,
      body.password,
      body.job,
    );
  }

  @Post('vToken')
  vToken(@Body() body): boolean {
    return this.authService.validateToken(body.token);
  }
}
