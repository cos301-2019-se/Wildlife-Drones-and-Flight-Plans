import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PoachingIncidentType } from './poaching-incident-type.entity';

export interface PoachingIncidentProperties {
  distanceToDams: number;
  distanceToRivers: number;
  distanceToRoads: number;
  distanceToResidences: number;
  distanceToExternalResidences: number;
  distanceToIntermittentWater: number;
  altitude: number;
  slopiness: number;
}

@Entity()
export class PoachingIncident {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  timestamp: Date;

  @Column('float')
  longitude: number;

  @Column('float')
  latitude: number;

  @Column()
  description: string;

  @Column()
  month: number;

  @Column()
  time: number;

  @Column()
  propertiesData: string;

  get properties(): PoachingIncidentProperties {
    return JSON.parse(this.propertiesData);
  }

  set properties(data: PoachingIncidentProperties) {
    this.propertiesData = JSON.stringify(data);
  }

  @ManyToOne(type => PoachingIncidentType, poachingType => poachingType.id)
  type: PoachingIncidentType;
}
