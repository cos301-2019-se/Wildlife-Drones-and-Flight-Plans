import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { AnimalCellWeight } from './animal-cell-weight.entity';
import { PoachingCellWeight } from './poaching-cell-weight.entity';

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
  distanceToRivers: number;

  @Column()
  distanceToDams: number;

  @Column()
  distanceToRoads: number;

  @Column()
  distanceToResidences: number;

  @Column()
  distanceToIntermittentWater: number;

  @Column()
  altitude: number;

  @Column()
  slopiness: number;

  @OneToMany(type => AnimalCellWeight, animalCellWeight => animalCellWeight.cell)
    @JoinColumn()
    animalCell: AnimalCellWeight[];

    @OneToMany(type => PoachingCellWeight, poachingCellWeight => poachingCellWeight.cell)
    @JoinColumn()
    poachingCell: PoachingCellWeight[];
}
