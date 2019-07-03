import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class MapData {
  @PrimaryColumn('text')
  feature: string;

  @Column('blob')
  properties: string;
}
