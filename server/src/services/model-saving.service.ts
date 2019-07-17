/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { ModelData } from '../entity/model.entity';

@Injectable()
export class ModelSaving {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Adds a new model to the set if saved models on the system 
   * @param name The name under which the model will be saved 
   * @param data The data that contains the actuals saved model
   */
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

  /**
   * Returns a saved model from the system , by using a name lookup
   * @param name The name under which the model will is saved 
   * 
   */
  async getModel(name: string): Promise<JSON> {
    const con = await this.databaseService.getConnection();

    //will add model if it does not exist and will update it if it does
    try {
      const model = await con.getRepository(ModelData).findOne({ name: name });
      // tslint:disable-next-line:no-console
      console.log('Model data retirved: ' + model.name);
      return  JSON.parse(JSON.stringify(model));
    } catch (error) {
      console.log('Model data not sent');
      return JSON.parse('[]');
    }
  }
}
