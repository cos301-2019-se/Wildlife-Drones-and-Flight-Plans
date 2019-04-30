import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
//import {createUserTable} from "./entity/User";

//var conn;

/*function connect(){
 
   var conn = createConnection({
        type: "sqlite",
        database: "database.sqlite",
        entities: [
            User
        ],
        synchronize: true,
        logging: false
    
    })

    return conn;
}

//gets all user from db and all info 
export function getAllUsers()
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

export function getUser(_id)
{
   var con = connect() 
   var user;

   con.then(async connection => 
    {    
        let userRepository = connection.getRepository(User);
       
        user = await userRepository.find({id: _id});

        //console.log(user);

       return await user;
       
 
    }).catch(error => console.log(error));

    //.then( () => {return ["User {id: 2,name: 'Ted Saw',userName: 'TSaw',password: '123ert',jobType: 'Ranger' }"];})
}


//  let users = new Promise<JSON>((resolve,reject) => { resolve(JSON.parse("User {id: 2,name: 'Ted Saw',userName: 'TSaw',password: '123ert',jobType: 'Ranger' }")) ;
//  console.log(users);

/*async function s()
{
    let user = await getUser(2);
    console.log(user);
}

 s();*/


createConnection({
    type: "sqlite",
    database: "database.sqlite",
    entities: [
        User
    ],
    synchronize: true,
    logging: false

}).then(async connection => {

   //console.log(connection);

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

   /* if(! await connection.manager.find(User))
    {
        const CreateUserTable = new createUserTable();
        CreateUserTable.name = "Ted Saw";
        CreateUserTable.userName = "TSaw";
        CreateUserTable.password = "123ert";
        CreateUserTable.jobType = "Ranger";
        await connection.manager.save(CreateUserTable).then(CreateUserTable => {console.log("Saved a new user with id: " + CreateUserTable.id)});
    }*/

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    console.log("Here you can setup and run express/koa/any other framework.");

}).catch(error => console.log(error));
