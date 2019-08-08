import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToOne,
  Timestamp,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column()
  password: string;

  @Column()
  jobType: 'administrator' | 'pilot';

  @Column()
  email: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  codeExpires: Date;

  @Column({ nullable: true })
  loginAttemptsRemaining: number;

  @Column({ nullable: true })
  active: boolean;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
