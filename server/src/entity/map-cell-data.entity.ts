import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AnimalCellWeight } from './animal-cell-weight.entity';
import { PoachingCellWeight } from './poaching-cell-weight.entity';

export interface MapCellDataProperties {
  distanceToRivers: number;
  distanceToDams: number;
  distanceToRoads: number;
  distanceToResidences: number;
  distanceToIntermittentWater: number;
  distanceToExternalResidences: number;
  altitude: number;
  slopiness: number;
}

@Entity()
export class MapCellData {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('float')
  cellMidLongitude: number;

  @Column('float')
  cellMidLatitude: number;

  @Column()
  lastVisited: Date;

  @Column()
  propertiesData: string;

  get properties(): MapCellDataProperties {
    return JSON.parse(this.propertiesData);
  }

  set properties(data: MapCellDataProperties) {
    this.propertiesData = JSON.stringify(data);
  }

  @OneToMany(
    type => AnimalCellWeight,
    animalCellWeight => animalCellWeight.cell,
  )
  @JoinColumn()
  animalCell: AnimalCellWeight[];

  @OneToMany(
    type => PoachingCellWeight,
    poachingCellWeight => poachingCellWeight.cell,
  )
  @JoinColumn()
  poachingCell: PoachingCellWeight[];
}

