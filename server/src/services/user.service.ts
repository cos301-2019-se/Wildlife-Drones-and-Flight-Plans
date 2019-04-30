import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { User } from '../entity/User';

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
}



/*export function getAllUsers()
{
   var con = connect() 
   con.then(async connection => 
    {    
        let userRepository = connection.getRepository(User);
        //console.log("Loading users from the database...");
        const AllUsers = await userRepository.find();
        //console.log("Loaded users: ", users);
 
        //console.log("Here you can setup and run express/koa/any other framework.");
        return AllUsers;
 
    }).catch(error => console.log(error));

}

export async function getUser(_id)
{
   const connection = await connect() 
   //var user;

   
        let userRepository = connection.getRepository(User);
       
       var user = await userRepository.find({id: _id});

        console.log(user);

       return user;

    //.then( () => {return ["User {id: 2,name: 'Ted Saw',userName: 'TSaw',password: '123ert',jobType: 'Ranger' }"];})
}


export function userExist(_id)
{
   var con = connect() 
   //var user;

   con.then(async connection => 
    {    
        let userRepository = connection.getRepository(User);
       
       var user = await userRepository.find({id: _id});

        if(user.toString() == ""  )
            console.log(false);
            //return false;
        else
            console.log(true)
            //return true;

      // return await user;
       
 
    }).catch(error => console.log(error));

}

export function pass(_email, _pass)
{
   var con = connect() 
   //var user;

   con.then(async connection => 
    {    
        let userRepository = connection.getRepository(User);
       
       var user = await userRepository.find({email: _email});

       if()

        if(user.toString() == ""  )
            console.log(false);
            //return false;
        else
            console.log(true)
            //return true;

      // return await user;
       
 
    }).catch(error => console.log(error));

}


console.log("Inserting a new user into the database...");
    const user = new User();
    user.name = "Andreas Louw";
    user.userName = "ALouw";
    user.password = "1qwesdf";
    user.jobType = "pilot";
    user.email = "alouw@gmail.com";
    user.token = "lir47z";
    user.expires = "01/05/2019"
    await connection.manager.save(user).then(user => {console.log("Saved a new user with id: " + user.id)});
*/