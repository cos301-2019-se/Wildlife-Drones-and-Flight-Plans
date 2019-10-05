import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MapCellData } from './map-cell-data.entity';
import { Species } from './animal-species.entity';

@Entity()
export class AnimalCellWeight {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(type => MapCellData, mapCellData => mapCellData.id)
  cell: MapCellData;

  @ManyToOne(type => Species, species => species.id)
  species: Species;

  @Column('float')
  time0Weight: number;

  @Column('float')
  time120Weight: number;

  @Column('float')
  time240Weight: number;

  @Column('float')
  time360Weight: number;

  @Column('float')
  time480Weight: number;

  @Column('float')
  time600Weight: number;

  @Column('float')
  time720Weight: number;

  @Column('float')
  time840Weight: number;

  @Column('float')
  time960Weight: number;

  @Column('float')
  time1080Weight: number;

  @Column('float')
  time1200Weight: number;

  @Column('float')
  time1320Weight: number;
}
