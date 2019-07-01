const MLR = require('ml-regression-multivariate-linear');
import * as fs from 'fs';
export class RegressionModel {
  private model: any;
  private logsEnabled: boolean;
  constructor() { }

  public enableLogs(logsEnabled) {
    this.logsEnabled = logsEnabled;
    this.log('Logs are enabled');
  }
  // Trains the model with the inputs
  public trainModel(inputs, output) {
    this.model = new MLR(inputs, output);
    //console.log(JSON.stringify(this.model));
    this.log('Model has been trained');
  }

  // Prediction of the model
  public predict(inputs) {
    const predictions = this.model.predict(inputs);
    this.log('Model has predicted');
    return predictions;
  }

  // Saves a model to HDD
  public async saveModel(modelName, modelSaving) {
    // const jsonModel = JSON.stringify(this.model.toJSON());
    const jsonModel = this.model.toJSON();
    const result = await modelSaving.addModel(modelName, jsonModel);
    //fs.writeFileSync('ai_models/' + modelName + '.json', jsonModel);
    if (result) {
      this.log('Model has been saved');
    }
    else {
      this.log('Model has not been saved');
    }

  }

  // Loads a model from storage
  public async loadModel(modelName, modelSaving) {
    /* if (!fs.existsSync('ai_models/' + modelName + '.json')) {
       this.log('Model does not exist');
       return null;
     }*/
    const result = await modelSaving.getModel(modelName);
    /*const jsonModel = fs.readFileSync(
      'ai_models/' + modelName + '.json',
      'utf8',
    );*/
    if (result == []) {
      return null;
    }
    this.model = MLR.load(JSON.parse(result.properties));
    this.log('Model has been loaded');
    return this;
  }

  // Logs messages
  private log(message) {
    if (this.logsEnabled === true) {
      console.log(message);
    }
  }
}
