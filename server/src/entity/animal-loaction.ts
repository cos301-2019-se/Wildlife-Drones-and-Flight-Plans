import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Animal_locations {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    animal_id: string;

    @Column("text")
    timestamp: string;

    @Column("text")
    date: string;

    @Column("text")
    year: string;

    @Column("text")
    month: string;

    @Column("text")
    day: string;

    @Column("text")
    time: string;

    @Column("text")
    hour: string;
    
    @Column("text")
    minute: string;

    @Column("text")
    second: string;

    @Column("text")
    longitude: string; 

    @Column("text")
    latitude: string;

    @Column("text")
    temperature: string;

    @Column("text")
    habitat: string;

    @Column("text")
    individuallocalidentifier: string;
   

}
