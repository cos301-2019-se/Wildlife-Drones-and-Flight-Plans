import { Injectable } from '@nestjs/common';
import { RegressionModel } from './regression-model.service';
import { AnimalLocationService } from '../services/animal-location.service';

// This class trains the models from database data
@Injectable()
export class ModelTraining {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

  /**
   * Trains the model for the animal predictions to be made
   * @param modelName The name under which the model will be saved , this name refers to the animal species 
   */
  
  async trainModel(modelName): Promise<void> {
    const model = new RegressionModel();
    model.enableLogs(true);
    // AnimalLocationService
    const data = await this.animalLocationService.getAllAnimalsLocationTableData();
    const jsonData = JSON.parse(JSON.stringify(data));

    const inputData = jsonData.map(animal => [
      parseFloat(animal.latitude),
      parseFloat(animal.longitude),
      parseInt(animal.month),
      parseInt(animal.time),
      parseInt(animal.temperature),
      parseFloat(animal.distanceToRivers),
      parseFloat(animal.distanceToDams),
      parseFloat(animal.distanceToRoads),
      parseFloat(animal.distanceToResidences),
      parseFloat(animal.distanceToIntermittentWater),
      parseFloat(animal.altitude),
    ]);
    inputData.pop();

    const outputData = jsonData.map(animal => [
      parseFloat(animal.latitude),
      parseFloat(animal.longitude),
    ]);
    outputData.shift();

    model.trainModel(inputData, outputData);
    model.saveModel(modelName);
  }

  /**
   * Makes a prediction to the whereabouts of where an animal may be
   * @param modelName The name under which the model is  saved 
   * @param predictioninput The predicted results to where the animal's location is
   */
  async predict(modelName, predictioninput): Promise<JSON> {
    const tempModel = new RegressionModel();
    const model = tempModel.loadModel(modelName);
    if (model == null) {
      return null;
    }
    const jsonData: any[] = JSON.parse(JSON.stringify(predictioninput));

    const subset = jsonData
      .map(animal => [
        parseFloat(animal.latitude),
        parseFloat(animal.longitude),
        parseInt(animal.month),
        parseInt(animal.time),
        parseInt(animal.temperature),
        parseFloat(animal.distanceToRivers),
        parseFloat(animal.distanceToDams),
        parseFloat(animal.distanceToRoads),
        parseFloat(animal.distanceToResidences),
        parseFloat(animal.distanceToIntermittentWater),
        parseFloat(animal.altitude),
      ]);

    const predictions = model.predict(subset);
    return JSON.parse(
      JSON.stringify({
        predictions,
      }),
    );
  }
}
