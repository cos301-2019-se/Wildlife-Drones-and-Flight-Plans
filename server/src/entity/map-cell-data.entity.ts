import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { AnimalCellWeight } from './animal-cell-weight.entity';

@Entity()
export class MapCellData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  cellMidLongitude: number;

  @Column()
  cellMidLatitude: number;

  @Column()
  lastVisited: Date;

  @Column()
  distantceToRivers: number;

  @Column()
  distantceToDams: number;

  @Column()
  distanceToRoads: number;

  @Column()
  distanceToResidences: number;

  @Column()
  distanceToIntermittentWater: number;

  @OneToMany(type => AnimalCellWeight, animalCellWeight => animalCellWeight.cell)
    @JoinColumn()
    cell: AnimalCellWeight[];
}
