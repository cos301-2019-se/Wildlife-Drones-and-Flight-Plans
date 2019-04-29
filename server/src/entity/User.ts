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

    @Column({
        enum: ['Pilot', 'Ranger']
    })
    jobType: string;

}
