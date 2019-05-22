/* tslint:disable:no-console */
import { Injectable} from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/user';
import * as bcrypt from 'bcrypt';
import * as uuidv4 from 'uuid/v4';
import { defaultCoreCipherList } from 'constants';
import { STATUS_CODES } from 'http';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class UserService {

    constructor(private readonly databaseService: DatabaseService){}
     // private readonly authService: AuthService,
     //private readonly jwtService: JwtService) {}
    
     getAllUsers(): any {
        const con =  this.databaseService.getConnection();
        return con.then(async (data) => {
           console.log(await data.getRepository(User).find());
           return await data.getRepository(User).find();
        });
    }

    login(_email,_pass):any {


        const con =  this.databaseService.getConnection();
        return con.then(async (data)=>{
           
            const ExistingUser = await data.getRepository(User).findOne({email : _email})
            if(ExistingUser)
            {
            console.log(" compare result : " +  bcrypt.compareSync(_pass, ExistingUser.password));
            var today = new Date();
            var d = Date.parse(ExistingUser.expires)
            var d2 = new Date();
            var dateT = d2.toDateString();
            var c = Date.parse(dateT)
           let valid  = false;
           if(bcrypt.compareSync(_pass, ExistingUser.password) == true)
           {
               return true;
           }
             else
             {
                console.log('Password incorrect');
                return  false;
             }
            }
        })
    
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
                    const now = new Date();
                    now.setDate(now.getDate() + 1);
                    console.log(now);
                    user.expires = now.toString();
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
