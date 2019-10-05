import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Species } from './animal-species.entity';

export interface AnimalLocationProperties {
  distanceToDams: number;
  bearingToDams: number;
  distanceToRivers: number;
  bearingToRivers: number;
  distanceToRoads: number;
  bearingToRoads: number;
  distanceToResidences: number;
  bearingToResidences: number;
  distanceToIntermittentWater: number;
  bearingToIntermittentWater: number;
  altitude: number;
  slopiness: number;
}

@Entity()
export class AnimalLocation {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  animalId: string;

  @ManyToOne(type => Species, species => species.id)
  species: Species;

  @Column()
  timestamp: Date;

  @Column()
  month: number;

  @Column()
  time: number;

  @Column('float')
  longitude: number;

  @Column('float')
  latitude: number;

  @Column('float')
  temperature: number;

  @Column()
  habitat: string;

  @Column()
  propertiesData: string;

  get properties(): AnimalLocationProperties {
    return JSON.parse(this.propertiesData);
  }

  set properties(data: AnimalLocationProperties) {
    this.propertiesData = JSON.stringify(data);
  }

  @Column({ nullable: true })
  active: boolean;
}
