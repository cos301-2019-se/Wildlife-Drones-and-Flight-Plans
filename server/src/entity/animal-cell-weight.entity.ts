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

  @Column()
  weight: number;
 
}
