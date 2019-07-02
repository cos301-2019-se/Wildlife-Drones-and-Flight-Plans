import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, Double } from 'typeorm';
import { DroneRoute } from './drone-route.entity';

@Entity()
export class Drone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column()
  avgSpeed: number;

  @Column()
  avgFlightTime: number;

  @Column()
  speed: number;

  @Column()
  flightTime: number;

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
