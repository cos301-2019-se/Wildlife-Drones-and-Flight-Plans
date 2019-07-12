import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { PoachingIncidentType } from "../entity/poaching-incident-type.entity";

@Injectable()
export class PoachingIncidentTypeService{
  constructor(private readonly databaseService: DatabaseService) {}

  async addPoachingIncidentType(poachingType: string): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const poachingIncidentType = new PoachingIncidentType();

    poachingIncidentType.type = poachingType;
    // tslint:disable-next-line:no-console
    const addedPoachingIncidentType = await con.getRepository(PoachingIncidentType).save(poachingIncidentType);
    console.log(
      'Saved a new poaching incident type with id: ' + poachingIncidentType.id,
    );
    return addedPoachingIncidentType != null;
  }
}
