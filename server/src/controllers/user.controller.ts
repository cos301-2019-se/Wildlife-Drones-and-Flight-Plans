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


  /**
   * Returns all the users in the system 
   * Being used for testing purposes 
   */

  @Get('getUsers')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  /**
   * Logs a user into the system and grants access to gaurded endpoints
   * This is saved within the database 
   * @param email The email of the user being added to the system 
   * @param password The password that will be used to authenticate a user on the system
   * Will return true if the function executed correctly 
   */

  @Post('login')
  async loginUser(@Body() body): Promise<JSON> {
    const status = await this.userService.login(body.email, body.password);
    if (status) {
      return await this.authService.createToken(body.email);
    }
  }

  /**
   * Adds a user to the system ,this is done by an admin
   * This is saved within the database 
   * @param name The name of the person being added to the system 
   * @param email The email of the user being added to the system
   * @param password The secret key a user will use to log into he system
   * @param job The job type of the user being added either Pilot,Admin or Ranger (in lowercase)
   */
  @Post('addUser')
  async addUser(@Body() body): Promise<boolean> {
    return await this.userService.addUser(
      body.name,
      body.email,
      body.password,
      body.job,
    );
  }

  /**
   * Testing function to validate tokens and gaurded access 
   */
  @Post('vToken')
  vToken(@Body() body): boolean {
    return this.authService.validateToken(body.token);
  }
}
