import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum MapFeatureType {
  reserve = 'reserve',
  dams = 'dams',
  rivers = 'rivers',
  intermittent = 'intermittent',
  roads = 'roads',
  residential = 'residential',
  externalResidential = 'externalResidential',
}

@Entity()
export class MapData {
  @PrimaryColumn('text')
  feature: string;

  @Column()
  propertiesData: string;

  get properties(): any {
    return JSON.parse(this.propertiesData);
  }

  set properties(data: any) {
    this.propertiesData = JSON.stringify(data);
  }
}
