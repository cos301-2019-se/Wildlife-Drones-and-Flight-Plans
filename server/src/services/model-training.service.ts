import { Injectable } from '@nestjs/common';
import { RegressionModel } from '../providers/regression-model.service';
import { AnimalLocationService } from '../services/animal-location.service';
// This class trains the models from database data
@Injectable()
export class ModelTraining {
    constructor(private readonly animalLocationService: AnimalLocationService) { }

    async trainModel(modelName): Promise<void> {
        const model = new RegressionModel();
        model.enableLogs(true);
        // AnimalLocationService
        const data = await this.animalLocationService.getAllAnimalsLocationTableData();
        const jsonData = JSON.parse(JSON.stringify(data));
        const outputData = jsonData.filter(animal => (parseInt(animal.id) % 2) != 1).map(animal => [
            parseFloat(animal.latitude), parseFloat(animal.longitude),
        ]);
        const inputData = jsonData.filter(animal => animal.id < jsonData.length && (parseInt(animal.id) % 2) != 0).map(animal => [
            parseFloat(animal.latitude), parseFloat(animal.longitude), parseInt(animal.month), parseInt(animal.time),
            parseInt(animal.temperature), parseFloat(animal.distanceToRivers), parseFloat(animal.distanceToDams),
            parseFloat(animal.distanceToRoads), parseFloat(animal.distanceToResidences), parseFloat(animal.distanceToIntermittentWater),
            parseFloat(animal.altitude),
        ]);

        model.trainModel(inputData, outputData);
        model.saveModel(modelName);
    }

    async predict(modelName): Promise<JSON> {
        const tempModel = new RegressionModel();
        const model = tempModel.loadModel(modelName);
        if (model == null) {
            return null;
        }
        const data = await this.animalLocationService.getIndividualAnimalLocationTableData('AM105');
        const jsonData = JSON.parse(JSON.stringify(data));
        const outputData = jsonData.filter(animal => (parseInt(animal.id) % 2) != 1 && animal.animalId == 'AM105').map(animal => [
            parseFloat(animal.latitude), parseFloat(animal.longitude),
        ]);
        const inputData =  jsonData.filter(animal => animal.id < jsonData.length && (parseInt(animal.id) % 2) != 0 
                                                    && animal.animalId == 'AM105').map(animal => [
            parseFloat(animal.latitude), parseFloat(animal.longitude), parseInt(animal.month), parseInt(animal.time),
            parseInt(animal.temperature), parseFloat(animal.distanceToRivers), parseFloat(animal.distanceToDams),
            parseFloat(animal.distanceToRoads), parseFloat(animal.distanceToResidences), parseFloat(animal.distanceToIntermittentWater),
            parseFloat(animal.altitude),
        ]);
        const random = Math.floor(Math.random() * 3000) + 1;
        const predictions = [];
        for(var i = random; i < random + 10; i++)
        {
            var inputs = [];
            inputs.push(inputData[i][0]);
            inputs.push(inputData[i][1]);
            const data = {
                input:  inputs,
                output: outputData[i],
                prediction: model.predict(inputData[i]),
            }
            predictions.push(data);
        }
        return JSON.parse(JSON.stringify(predictions));
    }
}