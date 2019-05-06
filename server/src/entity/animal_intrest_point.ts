import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Animal_intrest_point {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    name: string;

    @Column("text")
    Point_description: string;   

    @Column("text")
    longatude: string; 

    @Column("text")
    latitude: string;

}
