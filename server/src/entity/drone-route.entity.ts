import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Drone } from './drone.entity';

@Entity()
export class DroneRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Drone, drone => drone.id)
  drone: Drone;

  @Column('text')
  points: string;

  @Column('text')
  percentComplete: string;

  @Column()
  timestamp: Date;

  @Column()
  active: boolean;
}
