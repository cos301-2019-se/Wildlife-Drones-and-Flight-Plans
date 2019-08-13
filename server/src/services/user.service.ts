import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../auth/jwt-payload.interface';
import * as mailer from 'nodemailer';
import { ConfigService } from './config.service';
import { MailService } from './mail.service';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
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

  async loginEmail(email): Promise<boolean> {
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

    // generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // set the user's OTP in the database
    existingUser.code = otp;
    await con.getRepository(User).save(existingUser);

    // more readable version of OTP (XXX-XXX)
    const otpString = `${otp.substring(0, 3)}-${otp.substring(3, 6)}`;

    // send th email out
    await this.mailService.send({
      subject: `Your one time PIN is: ${otpString}`,
      template: 'otp.twig',
      templateParams: {
        otp: otpString,
      },
      to: email,
    });

    return true;
  }

  async loginPin(email, password, otp): Promise<boolean> {
    // remove hyphen from otp
    otp = otp.replace('-', '');

    const con = await this.databaseService.getConnection();
    const usersRepo = con.getRepository(User);

    const existingUser = await usersRepo.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      console.log('the user actually does not exist');
      return false;
    }

    if (
      bcrypt.compareSync(password, existingUser.password) &&
      existingUser.code === otp
    ) {
      console.log('The password matches the db password ');
      return true;
    } else {
      console.log('the password is not the same');
    }
  }

  async reset(email): Promise<boolean> {
    var num = Math.floor(100000 + Math.random() * 900000);
    var num1 = num.toString();
    var s = '';
    s +=
      ' </head><body><span class="preheader"><h2> Your reset code is ' +
      num1.substring(0, 3) +
      '-' +
      num1.substring(3, 6) +
      '</h2></span> <table class="email-wrapper" role="presentation" width="100%" cellspacing="0" cellpadding="0">';
    s +=
      '<tbody><tr><td align="center"><table class="email-content" role="presentation" width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td class="email-masthead">';
    s +=
      '</td></tr><!-- Email Body --><tr><td class="email-body" cellpadding="0" cellspacing="0" width="570"><table class="email-body_inner" role="presentation" width="570" cellspacing="0" cellpadding="0" align="center">  <!-- Body content --> <tbody><tr><td class="content-cell"><div class="f-fallback"><p>You recently requested to reset your password for your WDS account. Use the code below to reset it. <strong>This password reset is only valid for the next 24 hours.</strong></p> <!-- Action --><table class="body-action" role="presentation" width="100%" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td align="center"><!-- Border based button';
    s +=
      'https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design --><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td align="center"><a href="{{action_url}}" class="f-fallback button button--green" target="_blank"><strong> Your reset code is <h1>' +
      num1.substring(0, 3) +
      '-' +
      num1.substring(3, 6) +
      ' </h1></strong></a></td></tr></tbody></table></td></tr></tbody></table>';
    s +=
      '<p>If you did not request a password reset, please ignore this email or <a href="{{support_url}}">contact support</a> if you have questions.</p><p>Thanks,<br>The [WDS] Team</p><!-- Sub copy --><table class="body-sub" role="presentation"><tbody><tr><td> <p class="f-fallback sub">{{action_url}}</p></td></tr></tbody></table></div></td></tr></tbody></table></td></tr>';
    s +=
      '<tr><td><table class="email-footer" role="presentation" width="570" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td class="content-cell" align="center"><p class="f-fallback sub align-center">© 2019 [Product Name]. All rights reserved.</p><p class="f-fallback sub align-center">[EPI-USE, LLC]<br>1234 Street Rd.<br>Suite 1234</p></td></tr> </tbody></table></td></tr></tbody></table></td></tr></tbody></table></body></html>';

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

    let tp = mailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: 'drbam301@gmail.com',
        pass: 'drbamisawesome',
      },
      tls: {
        rejectUnauthorized: false,
      },

      // proxy: "socks5://u16009917:Viper3489753489@vpn.up.ac.za:"
    });
    //return s;
    let mail = {
      from: '"DrBam" <drbam301@gmail.com>',
      to: email + ', reinhardt.eiselen@gmail.com',
      subject: 'Password reset',
      html: s,
    };

    tp.sendMail(mail);
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
