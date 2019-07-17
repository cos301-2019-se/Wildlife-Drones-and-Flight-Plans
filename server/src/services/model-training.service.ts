import { Injectable } from '@nestjs/common';
import { RegressionModel } from './regression-model.service';
import { AnimalLocationService } from '../services/animal-location.service';
import { ModelSaving } from './model-saving.service';
import { SpeciesService } from '../services/species.service';
import { AnimalCellWeightService } from '../services/animal-cell-weight.service';
import { Classifier } from './classification-model.service';
import { PoachingIncidentService } from '../services/poaching-incident.service';
import { MapCellDataService } from '../services/map-cell-data.service';
import { PoachingCellWeightService } from './poaching-cell-weight.service';
// This class trains the models from database data
@Injectable()
export class ModelTraining {
  constructor(
    private readonly animalLocationService: AnimalLocationService,
    private readonly modelSaving: ModelSaving,
    private readonly mapCell: MapCellDataService,
    private readonly species: SpeciesService,
    private readonly animalCell: AnimalCellWeightService,
    private readonly poachingIncidentService: PoachingIncidentService,
    private readonly poachingCell: PoachingCellWeightService
  ) { }

  // Model Name is referring to the species
  async trainRegressorModel(modelName): Promise<boolean> {
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
    return true;
  }

  // Get a prediction from the model specified
  async predictRegressor(modelName, predictionInput): Promise<JSON> {
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

  async trainAnimalClassifierModel(speciesName) {
    //  fetch data by species name

    const speciesId = await this.species.getSpeciesID(speciesName);

    const teachingData = (await this.animalLocationService.getSpeciesLocationTableData(speciesName))
      .map(animal => ({
        month: animal.month,
        time: animal.time,
        // temperature: parseInt(animal.temperature),
        distanceToRivers: animal.distanceToRivers,
        distanceToDams: animal.distanceToDams,
        distanceToRoads: animal.distanceToRoads,
        distanceToResidences: animal.distanceToResidences,
        distanceToIntermittentWater: animal.distanceToIntermittentWater,
        altitude: animal.altitude,
        slopiness: animal.slopiness,
      }));

    //  Populate classifier with teaching data
    console.time('Populate KNN');
    const classifier = new Classifier(teachingData);
    console.timeEnd('Populate KNN');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
    console.time('Fetch Cell Data');
    const cellData = await this.mapCell.getCellsData();
    console.timeEnd('Fetch Cell Data');

    const month = new Date().getMonth() + 1;
    const countPercentage = cellData.length / 10;
    let currentCount = countPercentage;
    // Foreach of the cells on the map
    cellData.forEach((cell, cellId) => {
      const animalCellWeight = {
        cellId: cell.id,
        speciesId,
      };
      if (cellId > currentCount) {
        currentCount += countPercentage;
        console.log('Classified ' + Math.floor((cellId / cellData.length) * 100) + '%');
      }
      for (let i = 0; i < 12; i++) {
        const time = i * 120;
        const cellDistances = {
          month,
          time,
          // temperature: parseInt(animal.temperature),
          distanceToRivers: cell.distanceToRivers,
          distanceToDams: cell.distanceToDams,
          distanceToRoads: cell.distanceToRoads,
          distanceToResidences: cell.distanceToResidences,
          distanceToIntermittentWater: cell.distanceToIntermittentWater,
          altitude: cell.altitude,
          slopiness: cell.slopiness,
        };
        animalCellWeight[`weight${time}`] = classifier.getDistance(cellDistances);
      }
      this.animalCell.addAnimalCellsWeight(animalCellWeight);
    });
    return true;
  }

  async trainPoachingClassifierModel() {
    //  fetch data by species name
    const data = await this.poachingIncidentService.getAllPoachingIncidentTableData();
    const jsonData = JSON.parse(JSON.stringify(data));
    const teachingData = [];
    // sort all data to teach classifier
    jsonData.forEach(incident => {
      const coordinateData  = JSON.parse(incident.CoordinateData);
      teachingData.push({
        // month: parseInt(incident.month), unsure of relavance
        // time: parseInt(incident.time),  // not used at the moment
        /* distanceToFarm: parseFloat(coordinateData.distanceToFarm),
         distanceToVillage: parseFloat(coordinateData.distanceToVillage),
         distanceToTown: parseFloat(coordinateData.distanceToTown),
         distanceToSuburb: parseFloat(coordinateData.distanceToSuburb),
         distanceToStream: parseFloat(coordinateData.distanceToStream),*/
        distanceToRivers: parseFloat(coordinateData.distanceToRivers),
        distanceToDams: parseFloat(coordinateData.distanceToDams),
        distanceToRoads: parseFloat(coordinateData.distanceToRoads),
        distanceToResidences: parseFloat(coordinateData.distanceToResidences),
        distanceToIntermittentWater: parseFloat(coordinateData.distanceToIntermittentWater),
        altitude: parseFloat(coordinateData.altitude),
        slopiness: parseFloat(coordinateData.slopiness),
      });
    });
    //  Populate classifier with teaching data
    console.time('Populate KNN');
    const classifier = new Classifier(teachingData);
    console.timeEnd('Populate KNN');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
    console.time('Fetch Cell Data');
    const cellData = await this.mapCell.getCellsData();
    console.timeEnd('Fetch Cell Data');
    console.log('Done Training Classifier');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
    cellData.forEach(cell => {
      const midPointClassification = {
          distanceToRivers: cell.distanceToRivers,
          distanceToDams: cell.distanceToDams,
          distanceToRoads: cell.distanceToRoads,
          distanceToResidences: cell.distanceToResidences,
          distanceToIntermittentWater: cell.distanceToIntermittentWater,
          altitude: cell.altitude,
          slopiness: cell.slopiness
        };
      const poachingCellWeight = {
        cellId: cell.id,
        weight: classifier.getDistance(midPointClassification),
      };
      const added = this.poachingCell.addPoachingCellsWeight([poachingCellWeight]);
    });
    return true;
  }
}
