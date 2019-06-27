/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { ModelData } from '../entity/model.entity';

@Injectable()
export class ModelSaving {
  constructor(private readonly databaseService: DatabaseService) {}

  async addModel(name: string, data: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const model = new ModelData();

    //will add model if it does not exist and will update it if it does
    try {
      model.name = name;
      model.properties = JSON.stringify(data);
      // tslint:disable-next-line:no-console
      const addedModel = await con.getRepository(ModelData).save(model);
      console.log('Saved model with name: ' + model.name);
      return addedModel != null;
    } catch (error) {
      console.log('Model not saved');
      return false;
    }
  }

  async getModel(name: string): Promise<JSON> {
    const con = await this.databaseService.getConnection();

    //will add model if it does not exist and will update it if it does
    try {
      const model = con.getRepository(ModelData).findOne({ name: name });
      // tslint:disable-next-line:no-console
      console.log('Model data retirved: ' + model.name);
      return JSON.parse(model);
    } catch (error) {
      console.log('Model data not sent');
      return JSON.parse('[]');
    }
  }
}
