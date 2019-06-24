import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { PoachingIncident } from './poaching-incident.entity';

@Entity()
export class PoachingIncidentType {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  type: string;

  @OneToMany(type => PoachingIncident, poachingIncident => poachingIncident.type)
  @JoinColumn()
  poachingIncidents: PoachingIncident[];
}
