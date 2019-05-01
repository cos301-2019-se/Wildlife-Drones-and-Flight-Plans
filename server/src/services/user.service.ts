import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as uuidv4 from 'uuid/v4';

@Injectable()
export class UserService {

    constructor(private readonly databaseService: DatabaseService) {}
 
     getAllUsers(): any {
        const con =  this.databaseService.getConnection();
        return con.then(async (data)=>{
           console.log(await data.getRepository(User).find())
           return await data.getRepository(User).find(); 
        })  
    }

    login(_email,_pass):any {
        const con =  this.databaseService.getConnection();
        return con.then(async (data)=>{
            const ExistingUser = await data.getRepository(User).findOne({email : _email})
            console.log(" compare result : " +  bcrypt.compareSync(_pass, ExistingUser.password));
            let temp = bcrypt.compareSync(_pass, ExistingUser.password)
            return await temp;
        })
    }

    addUser(_name,_username,_password,_job,_email):boolean {

        const con =  this.databaseService.getConnection();
        let registerUser = con.then(async (data)=>{
        let user = new User();

        bcrypt.genSalt(5, function(err, salt) {
                 bcrypt.hash(_password, salt, function(err, hash) {
                    user.name = _name;
                    user.userName = _username;
                    user.password = hash;
                    user.jobType = _job;
                    user.email = _email;
                    user.salt = salt;
                    user.token = "lir47x";
                    user.expires = "02/05/2019"
                    return  data.manager.save(user).then(user => {console.log("Saved a new user with id: " + user.id)});
                    });
                });
            })

    if(registerUser != null)
    {
            return true;
    }
    else{

    return false;
    }
    }
}


