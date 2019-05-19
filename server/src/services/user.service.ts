/* tslint:disable:no-console */
import { Injectable} from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/user';
import * as bcrypt from 'bcrypt';
import * as uuidv4 from 'uuid/v4';

@Injectable()
export class UserService {

    constructor(private readonly databaseService: DatabaseService) {}

     getAllUsers(): any {
        const con =  this.databaseService.getConnection();
        return con.then(async (data) => {
           console.log(await data.getRepository(User).find());
           return await data.getRepository(User).find();
        });
    }

    login(aEmail, aPass): any {


        const con =  this.databaseService.getConnection();
        return con.then(async (data) => {

            const ExistingUser = await data.getRepository(User).findOne({email : aEmail});
            if (ExistingUser) {
            console.log(' compare result : ' +  bcrypt.compareSync(aPass, ExistingUser.password));
            const today = new Date();
            const d = Date.parse(ExistingUser.expires);
            const d2 = new Date();
            const dateT = d2.toDateString();
            const c = Date.parse(dateT);
            const valid  = false;
            if (bcrypt.compareSync(aPass, ExistingUser.password) === true) {
                if ((c - d) < (24 * 60 * 60 * 1000)) {
                    console.log('The token is still valid');
                    const newDate = new Date();
                    newDate.setDate(newDate.getDate() + 1);
                    ExistingUser.expires = newDate.toString();
                } else if ( (c - d) > (24 * 60 * 60 * 1000)) {
                    ExistingUser.token = uuidv4();
                }
                return {token: ExistingUser.token};
             } else {
                console.log('Password incorrect');
                return {token: ''};
             }
            } else {
                console.log('User does not exist');
                return {token: ''};
            }
        });

    }

    addUser(aName, aUsername, aPassword, aJob, aEmail): boolean {

        const con =  this.databaseService.getConnection();
        const registerUser = con.then(async (data) => {
        const user = new User();

        bcrypt.genSalt(5, (err, salt) => {
                 bcrypt.hash(aPassword, salt, (err, hash) => {
                    user.name = aName;
                    user.userName = aUsername;
                    user.password = hash;
                    user.jobType = aJob;
                    user.email = aEmail;
                    user.token = uuidv4();
                    const temp = new Date();
                    temp.setDate(temp.getDate() + 1);
                    console.log(temp);
                    user.expires = temp.toString();
                    return  data.manager.save(user).then(user => {console.log('Saved a new user with id: ' + user.id); });
                    });
                });
            });

        return registerUser != null;
    }

    vToken(aEmail, aToken): any {

        const con =  this.databaseService.getConnection();
        return con.then(async (data) => {
            const ExistingUser = await data.getRepository(User).findOne({email : aEmail});
            if (ExistingUser) {
            // console.log(" compare result : " +  bcrypt.compareSync(_pass, ExistingUser.password));
            // console.log(ExistingUser);
            if (ExistingUser.token !== aToken) {
                return await false;
            }
            if (ExistingUser.token === aToken) {
               // console.log("User token in database" + ExistingUser.token);
               const temp = new Date();
               temp.setDate(temp.getDate() + 1);
               console.log(temp);
               ExistingUser.expires = temp.toString();
                // console.log("User token sent in " +token)
               return  await true;
            } else {
                return await false;
            }
        } else {
            return await false;
        }

        });
    }

}


