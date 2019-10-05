import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Double } from 'typeorm';
import { Drone } from './drone.entity';

@Entity()
export class DroneRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Drone, drone => drone.id)
  drone: Drone;

  @Column('text')
  points: string;

  @Column()
  percentComplete: number;

  @Column()
  timestamp: Date;

  @Column()
  active: boolean; 
}
