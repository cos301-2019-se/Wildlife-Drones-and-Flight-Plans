import { Injectable } from '@nestjs/common';
import { RegressionModel } from './regression-model.service';
import { AnimalLocationService } from '../services/animal-location.service';

// This class trains the models from database data
@Injectable()
export class ModelTraining {
  constructor(private readonly animalLocationService: AnimalLocationService) {}

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

  async predict(modelName): Promise<JSON> {
    const tempModel = new RegressionModel();
    const model = tempModel.loadModel(modelName);
    if (model == null) {
      return null;
    }
    const data = await this.animalLocationService.getIndividualAnimalLocationTableData(
      'AM105',
    );
    const jsonData: any[] = JSON.parse(JSON.stringify(data));

    const numPoints = 200;
    const randomOffset = Math.floor(
      Math.random() * (jsonData.length - numPoints - 1),
    );
    const subset = jsonData
      .slice(randomOffset, randomOffset + numPoints)
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

    const predictions = subset.map(location => model.predict(location));

    return JSON.parse(
      JSON.stringify({
        points: subset.map(el => [el[0], el[1]]),
        predictions,
      }),
    );
  }
}
