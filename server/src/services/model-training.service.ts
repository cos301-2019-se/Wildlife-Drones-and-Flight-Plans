import { Injectable } from '@nestjs/common';
import { RegressionModel } from './regression-model.service';
import { AnimalLocationService } from '../services/animal-location.service';
import { ModelSaving } from './model-saving.service';
// This class trains the models from database data
@Injectable()
export class ModelTraining {
  constructor(private readonly animalLocationService: AnimalLocationService, private readonly modelSaving: ModelSaving) {}

  // Model Name is referring to the species
  async trainModel(modelName): Promise<void> {
    const model = new RegressionModel();
    model.enableLogs(true);
    // AnimalLocationService
    const data = await this.animalLocationService.getSpeciesLocationTableData(modelName);
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
    await model.saveModel(modelName, this.modelSaving);
  }

  // Get a prediction from the model specified
  async predict(modelName, predictionInput): Promise<JSON> {
    const tempModel = new RegressionModel();
    const model = await tempModel.loadModel(modelName, this.modelSaving);
    if (model == null) {
      return null;
    }
    const jsonData: any[] = JSON.parse(JSON.stringify(predictionInput));

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
