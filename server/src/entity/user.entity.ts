import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Ranger } from "./ranger.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  password: string;

  @Column('text')
  jobType: 'manager' | 'pilot' | 'ranger';

  @Column('text')
  email: string;

  @OneToOne(type=> Ranger, ranger => ranger.ranger)
  ranger : Ranger

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }

}
