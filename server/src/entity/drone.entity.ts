import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, Double } from 'typeorm';
import { DroneRoute } from './drone-route.entity';

@Entity()
export class Drone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('float')
  avgSpeed: number;

  @Column('float')
  avgFlightTime: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  speed: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  flightTime: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  longitude: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  latitude: number;

  @Column()
  active: boolean;

  @OneToMany(type => DroneRoute, droneRoute => droneRoute.drone)
  @JoinColumn()
  route: DroneRoute[];

}
