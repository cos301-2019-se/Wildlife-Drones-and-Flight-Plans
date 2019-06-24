/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { ModelData } from '../entity/model.entity';

@Injectable()
export class ModelSaving {
  constructor(private readonly databaseService: DatabaseService) { }

  async addModel(name: string, data: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const model = new ModelData();

    try {
      let exist = await con.getRepository(ModelData).findOne({ name: name });

      if (!exist) {
        try {
          model.name = name;
          model.properties = JSON.stringify(data);
          // tslint:disable-next-line:no-console
          const addedModel = await con.getRepository(ModelData).save(model);
          console.log('Saved model with name: ' + model.name);
          return addedModel != null;
        } catch (error) {
          return false;
        }
      }
      else {
        exist.properties = JSON.stringify(data);
        const updatedModel = await con.getRepository(ModelData).save(exist);
        console.log('Updated model with name: ' + exist.name);
        return updatedModel != null;
      }

    } catch (error) {
      return false;
    }
  }
}
