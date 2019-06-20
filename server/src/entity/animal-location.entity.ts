import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Species } from "./animal-species.entity";

@Entity()
export class AnimalLocation {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  animalId: string;  

  @ManyToOne(type => Species, species => species.id)
  species : Species;

  @Column()
  timestamp: Date;

  @Column()
  month: number;

  @Column()
  time: number;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  temperature: number;

  @Column()
  habitat: string;

  @Column()
  distanceToRivers: number;

  @Column()
  distanceToDams: number;

  @Column()
  distanceToRoads: number;

  @Column()
  distanceToResidences: number;

  @Column()
  distanceToIntermittentWater: number;

  @Column()
  altitude: number;

  @Column()
  slopiness: number;
}
