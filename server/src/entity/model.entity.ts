import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ModelData {
  @PrimaryColumn('text')
  name: string;

  @Column()
  data: string;
}
