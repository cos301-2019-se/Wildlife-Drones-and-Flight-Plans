import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PoachingIncidentType } from './poaching-incident-type.entity';

@Entity()
export class PoachingIncident {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  timestamp: Date;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  description: string;

  @ManyToOne(type => PoachingIncidentType, poachingType => poachingType.id)
  type: PoachingIncidentType;
}
