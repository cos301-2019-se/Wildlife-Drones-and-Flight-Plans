import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    name: string;

    @Column("text")
    userName: string;

    @Column("text")
    password: string; 


     /*@Column({
        //collation: {"Pilot" : text, "Ranger"};
        // enum: ['Pilot', 'Ranger']
     })*/
    @Column("text")
    jobType: 'manager' | 'pilot' | 'ranger'; //string;

    @Column("text")
    email: string;

    @Column("text")
    token: string;

    @Column("text")
    expires: string;

       
    @Column("text")
    salt: string;    



}
