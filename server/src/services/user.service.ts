import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllUsers(): Promise<User[]> {
    const con = await this.databaseService.getConnection();
    return await con.getRepository(User).find();
  }

  async login(email, password): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const usersRepo = con.getRepository(User);

    const existingUser = await usersRepo.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      return false;
    }

    return bcrypt.compareSync(password, existingUser.password);
  }

/** 
   * Validates the received password against the minimum password requirements.
   * Sends a boolean value as a response.
   * Matches a string of 8 or more characters.
   * That contains at least one digit.
   * At least one lowercase character. 
   * At least one uppercase character.
   * And can contain some special characters.
   * @param password The user's password 
  */

 passRequirements(password) {
  var re = /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$/;
  // Test returns true of false
  console.log(re.test(password))
  return re.test(password);
}



  async addUser(name, email, password, job): Promise<boolean> {

    if(this.passRequirements(password)) {
      const con = await this.databaseService.getConnection();

      const user = new User();
      user.name = name;
      user.email = email;
      user.password = password;
      user.jobType = job;

      const insertedUser = await con.getRepository(User).save(user);

      return !!insertedUser;
    }
    else {
      return false;
    }
  }

  async validateUser(payload: JwtPayload) {
    const con = await this.databaseService.getConnection();
    return await con.getRepository(User).findOne({
      where: {
        email: payload.email,
      },
    });
  }
}
