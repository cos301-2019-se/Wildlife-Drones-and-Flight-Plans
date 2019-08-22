import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../auth/jwt-payload.interface';
import * as mailer from 'nodemailer';
import { ConfigService } from './config.service';
import { MailService } from './mail.service';
import * as RandExp from 'randexp';


@Injectable()
export class UserService {
  private readonly NUM_LOGIN_ATTEMPTS = this.config.getConfig().auth.otp.attempts;
  private readonly EXPIRY_TIME = this.config.getConfig().auth.otp.expiryTime;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * gets all users that are active, returns the users id,name,surname,email and job title
   */
  async getAllUsers(): Promise<User[]> {
    const con = await this.databaseService.getConnection();
    return await con
      .getRepository(User)
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.surname',
        'user.email',
        'user.jobType',
      ])
      .where('user.active = true')
      .getMany();
  }

  /**
   * Sends a one-time PIN to the user for 2FA.
   * If the user's token has already been set, and the epiry time of the
   * token has not yet passed, the set token is re-sent.
   * Otherwise, the number of login attempts is reset, and a new pin
   * is generated and sent.
   * @param email The user's email address
   */
  async loginEmail(email): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const usersRepo = con.getRepository(User);

    const existingUser = await usersRepo.findOne({
      where: {
        email,
        //active : 'true',
      },
    });

    // if the email does not match a user, return false
    if (!existingUser) {
      return false;
    }


    // check that the user is within their number of login attempts
    // if the epiry date of the code has passed, we can create a new OTP
    // otherwise, we re-send the assigned OTP
    let reSending = true;
    if (existingUser.codeExpires <= new Date()) {
      existingUser.loginAttemptsRemaining = this.NUM_LOGIN_ATTEMPTS;
      reSending = false;
    }

    // generate an OTP
    const otpPattern = new RandExp(this.config.getConfig().auth.otp.pattern);
    const otp = reSending
      ? existingUser.code
      : otpPattern.gen();

    // set the user's OTP in the database
    existingUser.code = otp;

    // send th email out
    await this.mailService.send({
      subject: `Your one time PIN is: ${otp}`,
      template: 'otp.twig',
      templateParams: {
        otp,
        timeout: Math.floor(this.EXPIRY_TIME / 60000),
      },
      to: email,
    });

    existingUser.codeExpires = new Date(new Date().getTime() + this.EXPIRY_TIME);

    await usersRepo.save(existingUser);

    return true;
  }

  /**
   * Attempts to verify an OTP with the given username and password.
   * If the OTP does not match, it decrements the number of login attempts
   * remaining. If the number of login attempts is <= 0, the use will not be
   * permitted to log in until a new OTP is generated.
   * @param email The user's email address
   * @param password The user's password
   * @param otp The One Time PIN sent to the user
   */
  async loginPin(email: string, password: string, otp: string): Promise<{
    status: boolean;
    message: string;
  }> {
    // remove all hyphens from otp in case user entered them
    otp = otp.replace(/\-/g, '');

    const con = await this.databaseService.getConnection();
    const usersRepo = con.getRepository(User);

    const existingUser = await usersRepo.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      console.log('the user does not exist');
      return {
        status: false,
        message: 'The user does not exist',
      };
    }

    // if the expiry time has passed, send the OTP again
    if (existingUser.codeExpires <= new Date()) {
      this.loginEmail(email); // re-send the One Time Pin
      return {
        status: false,
        message: 'The OTP expired. Please enter new OTP.',
      };
    }

    // check that the password and OTP both match
    // if they do not, decrement the number of login attempts
    if (
      existingUser.loginAttemptsRemaining > 0 &&
      bcrypt.compareSync(password, existingUser.password) &&
      existingUser.code.replace(/\-/g, '') === otp
    ) {
      return {
        status: true,
        message: 'Successfully logged in',
      };
    }

    // reduce number of login attempts remaining
    existingUser.loginAttemptsRemaining--;
    await usersRepo.save(existingUser);

    // if the user has run out of login attempts
    // they must wait for the pin to expire
    if (existingUser.loginAttemptsRemaining <= 0) {
      const timeRemaining = (existingUser.codeExpires.getTime() - Date.now()) / 1000;
      return {
        status: false,
        message: `You have exceeded the number of login attempts. Wait ${Math.round(timeRemaining)} seconds.`,
      };
    }

    return {
      status: false,
      message: `Incorrect OTP or password. ${existingUser.loginAttemptsRemaining} attempt${existingUser.loginAttemptsRemaining > 1 ? 's' : ''} remaining.`
    };
  }

    async reset(email,otpTemp): Promise<boolean> {
     
      const con = await this.databaseService.getConnection();
      const usersRepo = con.getRepository(User);
  
      const existingUser = await usersRepo.findOne({
        where: {
          email,
          active : '1',
          code : otpTemp
        },
      });
      //console.log('The entered otp ',otpTemp)

     // console.log('The entered otp ',existingUser.code)
  
      // if the email does not match a user, return false
      if (!existingUser) {
        return false;
      }
  
  
      // check that the user is within their number of login attempts
      // if the epiry date of the code has passed, we can create a new OTP
      // otherwise, we re-send the assigned OTP
      let reSending = true;
      if (existingUser.codeExpires <= new Date()) {
        existingUser.loginAttemptsRemaining = this.NUM_LOGIN_ATTEMPTS;
        reSending = false;
      }
  
      console.log("The old expiry time",existingUser.codeExpires)
      // generate an OTP
      const otpPattern = new RandExp(this.config.getConfig().auth.otp.pattern);
      console.log("The new expiry time",existingUser.codeExpires)
      await usersRepo.save(existingUser);
      //const passwordPattern = new RandExp(/(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$/);
      const otp = reSending
        ? existingUser.code
        : otpPattern.gen() 
  
        let tempPass =  Math.floor(10000 + Math.random() * 90000);
        const newPass = tempPass.toString();
      // set the user's OTP in the database
      existingUser.code = otp;
      // send th email out
      await this.mailService.send({
        subject: `Your new password is : ${newPass}`,
        template: 'reset.twig',
        templateParams: {
          otp: otp,
          pass : newPass,
        },
        to: email,
      });
  
      existingUser.codeExpires = new Date(new Date().getTime() + this.EXPIRY_TIME);
      const temp = bcrypt.hashSync(newPass, 10);
      existingUser.password = temp;
      console.log("The newly hashed password ", temp);
      await usersRepo.save(existingUser);
  
      return true;
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
    console.log(re.test(password));
    return re.test(password);
  }

  /**
   * Adds user give name,surname,email,password and job (administrator or pilot)
   * @param name
   * @param email
   * @param password
   * @param job
   * @param surname
   */
  async addUser(name, email, password, job, surname): Promise<boolean> {
    if (this.passRequirements(password)) {
      const con = await this.databaseService.getConnection();
      const user = new User();
      user.name = name;
      user.email = email;
      user.password = password;
      user.jobType = job;
      user.surname = surname;
      user.loginAttemptsRemaining = 3;
      user.active = true;

      const insertedUser = await con.getRepository(User).save(user);

      return !!insertedUser;
    } else {
      return false;
    }
  }

  /**
   * updates user given a user id and any parameter, not all parameters have to be sent
   * @param id
   * @param name
   * @param surname
   * @param email
   * @param jobType
   */
  async updateUser(id, name, surname, email, jobType) {
    const con = await this.databaseService.getConnection();
    const user = await con.getRepository(User).findOne(id);

    if (!user) {
      console.log('User ' + id + ' was not found');
      return false;
    }

    try {
      user.name = name;
      user.surname = surname;
      user.email = email;
      user.jobType = jobType;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(User).save(user);
      console.log('User was updated with id: ' + user.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('User was not updated');
      return false;
    }
  }

  async getJobType(email) {
    const con = await this.databaseService.getConnection();
    const user = await con.getRepository(User).findOne({ email: email });

    return user.jobType;
  }

  /**
   * Deactivates user given the user id
   * @param id
   */
  async deactivateUser(id) {
    const con = await this.databaseService.getConnection();
    const user = await con.getRepository(User).findOne({ id: id });

    if (!user) {
      console.log('User ' + id + ' was not found');
      return false;
    }

    try {
      user.active = false;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(User).save(user);
      console.log('User was deactivated with id: ' + user.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('User was not deactivated');
      return false;
    }
  }

  async validateUser(payload: JwtPayload) {
    console.log(JSON.stringify(payload));
    const con = await this.databaseService.getConnection();
    return await con.getRepository(User).findOne({
      where: {
        email: payload.email,
      },
    });
  }
}
