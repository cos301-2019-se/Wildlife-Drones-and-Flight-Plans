import { Entity, Column, PrimaryColumn ,PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { AnimalLocation } from "./animal-location.entity";
import { AnimalCellWeight } from './animal-cell-weight.entity';

@Entity()
export class Species {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    species : string

    @OneToMany(type => AnimalLocation, animal => animal.species)
    @JoinColumn()
    Species: AnimalLocation[];

    @OneToMany(type => AnimalCellWeight, animalCellWeight => animalCellWeight.species)
    @JoinColumn()
    animalCellWeightSpecies: AnimalCellWeight[];
}
