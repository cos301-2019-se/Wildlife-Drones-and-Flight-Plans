import { Entity, Column, PrimaryColumn ,PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { AnimalLocation } from "./animal-location.entity";

@Entity()
export class Species {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    species : string

    @OneToMany(type => AnimalLocation, animal => animal.species)
    @JoinColumn()
    Species: AnimalLocation[];
}
