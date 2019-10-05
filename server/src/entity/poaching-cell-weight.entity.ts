import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MapCellData } from './map-cell-data.entity';

@Entity()
export class PoachingCellWeight {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(type => MapCellData, mapCellData => mapCellData.id)
  cell: MapCellData;

  @Column('float')
  weight: number;
}
