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
  time0Weight: number;

  @Column()
  time120Weight: number;

  @Column()
  time240Weight: number;

  @Column()
  time360Weight: number;

  @Column()
  time480Weight: number;

  @Column()
  time600Weight: number;

  @Column()
  time720Weight: number;

  @Column()
  time840Weight: number;

  @Column()
  time960Weight: number;

  @Column()
  time1080Weight: number;
 
  @Column()
  time1200Weight: number;

  @Column()
  time1320Weight: number;
}
