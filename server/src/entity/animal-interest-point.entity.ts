import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AnimalInterestPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  pointDescription: string;

  @Column('text')
  longitude: string;

  @Column('text')
  latitude: string;
}
