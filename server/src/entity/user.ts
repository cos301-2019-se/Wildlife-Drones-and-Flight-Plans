import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert} from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    @BeforeInsert()
    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }
}
