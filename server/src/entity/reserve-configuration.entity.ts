import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ReserveConfiguration {
  @PrimaryColumn('text')
  reserveName: string;

  @Column('text')
  cellSize: string;

}
