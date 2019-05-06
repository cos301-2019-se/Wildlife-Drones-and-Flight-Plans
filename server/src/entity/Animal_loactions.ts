import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Animal_locations {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    Animal_ID: number;

    @Column("text")
    date: Date;

    @Column("text")
    longatude: string; 

    @Column("text")
    latitude: string;

}
