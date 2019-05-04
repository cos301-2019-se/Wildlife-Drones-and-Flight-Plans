import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/User';
import * as bcrypt from 'bcrypt';
import * as uuidv4 from 'uuid/v4';
import { defaultCoreCipherList } from 'constants';
import { STATUS_CODES } from 'http';

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
            var today = new Date();
            var d = Date.parse(ExistingUser.expires)
            var d2 = new Date();
            var dateT = d2.toDateString();
            var c = Date.parse(dateT)
           let valid  = false;
           if(bcrypt.compareSync(_pass, ExistingUser.password) == true)
           {
                if((c - d) < (24*60*60*1000))
                {
                    console.log("The tokeen is still valid");
                        var newDate = new Date();
                        newDate.setDate(newDate.getDate() + 1);
                        ExistingUser.expires = newDate.toString();
                }
                else if( (c-d) > (24*60*60*1000))
                {
                    ExistingUser.token = uuidv4();
                }
                return await ExistingUser.token
             }
           
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
                    user.token = uuidv4();
                    var temp = new Date();
                    temp.setDate(temp.getDate() + 1);
                    console.log(temp)
                    user.expires = temp.toString();
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

    vToken(_email,_token):any {
      
        const con =  this.databaseService.getConnection();
        return con.then(async (data)=>{
            const ExistingUser = await data.getRepository(User).findOne({email : _email})
            //console.log(" compare result : " +  bcrypt.compareSync(_pass, ExistingUser.password));
            //console.log(ExistingUser);
            if(ExistingUser.token != _token)
            {
                return false;
            }
            if(ExistingUser.token == _token)
            {
               // console.log("User token in database" + ExistingUser.token);
               var temp = new Date();
               temp.setDate(temp.getDate() + 1);
               console.log(temp)
               ExistingUser.expires = temp.toString();
                //console.log("User token sent in " +_token)
                 return  await true;
            }
            else
            {
                return await false;
            }
           
        })
    }

}

