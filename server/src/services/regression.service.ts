import { Injectable } from '@nestjs/common';
import { Regressor } from '../libraries/regressor';
import { DatabaseService } from './db.service';
import { ModelData } from '../entity/model.entity';

@Injectable()
export class RegressionService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Trains a regressor for the given species
   */
  async trainRegressor(name: string, inputs: number[][], outputs: number[][]): Promise<boolean> {
    const model = new Regressor();

    model.trainModel(inputs, outputs);

    await this.saveRegressor(name, model);
    return true;
  }

  /**
   * Loads a trained regressor from the database and predicts
   * a set of inputs.
   * @param modelName The name of the regressor to load and use 
   * @param input List of input dimensions
   */
  async loadAndPredict(modelName: string, input: number[][]): Promise<number[][]> {
    const regressor = await this.loadRegressor(modelName);
    if (regressor == null) {
      return null;
    }

    return regressor.predict(input);
  }

  /**
   * Saves a trained regressor to the database so it can be re-used later
   * @param name The name of the regressor
   * @param regressor The trained regressor
   */
  async saveRegressor(name: string, regressor: Regressor): Promise<boolean> {
    const conn = await this.databaseService.getConnection();
    const model = new ModelData();

    // add model if it does not exist, update it if it does
    try {
      model.name = `regressor-${name}`;
      model.data = JSON.stringify(regressor);

      const addedModel = await conn.getRepository(ModelData).save(model);

      console.log('Saved model with name: ' + model.name);
      return addedModel != null;
    } catch (error) {
      console.error('Model not saved', error);
      return false;
    }
  }

  /**
   * Loads a trained regressor from the database
   * @param name The name of the regressor to retrieve
   */
  async loadRegressor(name: string): Promise<Regressor> {
    const conn = await this.databaseService.getConnection();

    //will add model if it does not exist and will update it if it does
    try {
      const model = await conn.getRepository(ModelData).findOne({
        name: `regressor-${name}`,
      });

      const regressor = Regressor.fromJSON(model.data);
      console.log('Model data retrieved: ' + model.name);
      return regressor;
    } catch (error) {
      console.error('Model data not sent', error);
      return null;
    }
  }
}