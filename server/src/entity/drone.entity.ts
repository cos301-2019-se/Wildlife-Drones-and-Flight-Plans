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

  @Column({
    nullable: true,
  })
  speed: number;

  @Column({
    nullable: true,
  })
  flightTime: number;

  @Column({
    nullable: true,
  })
  longitude: number;

  @Column({
    nullable: true,
  })
  latitude: number;

  @Column()
  active: boolean;

  @OneToMany(type => DroneRoute, droneRoute => droneRoute.drone)
  @JoinColumn()
  route: DroneRoute[];

}
