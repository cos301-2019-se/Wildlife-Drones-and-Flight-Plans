import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Ranger {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(type => User, user => user.id)
  @JoinColumn()
  ranger: User;

  @Column()
  time: Date;

  @Column('float')
  longitude: number;

  @Column('float')
  latitude: number;
}
