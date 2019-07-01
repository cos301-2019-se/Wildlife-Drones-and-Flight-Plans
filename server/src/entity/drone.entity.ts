import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { DroneRoute } from './drone-route.entity';

@Entity()
export class Drone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  avgSpeed: string;

  @Column('text')
  avgFlightTime: string;

  @Column('text')
  speed: string;

  @Column('text')
  flightTime: string;

  @Column()
  longitude: number;

  @Column()
  latitude: number;

  @Column()
  active: boolean;

  @OneToMany(type => DroneRoute, droneRoute => droneRoute.drone)
  @JoinColumn()
  route: DroneRoute[];

}
