import { Injectable } from '@nestjs/common';
import { AnimalLocationService } from '../services/animal-location.service';
import { AnimalCellWeightService } from '../services/animal-cell-weight.service';
import { Classifier } from '../libraries/classifier';
import { PoachingIncidentService } from '../services/poaching-incident.service';
import { PoachingCellWeightService } from './poaching-cell-weight.service';
import { MapService } from './map.service';
import { RegressionService } from './regression.service';
import { MapFeatureType } from '../entity/map-data.entity';
import { SRTMService } from './srtm.service';
import getDistance from '@turf/distance';
import { lineString } from '@turf/helpers';
import lineSliceAlong from '@turf/line-slice-along';

/**
 * Handles training of models and saving them to the database
 */
@Injectable()
export class ModelTraining {
  constructor(
    private readonly animalLocationService: AnimalLocationService,
    private readonly mapService: MapService,
    private readonly animalCellService: AnimalCellWeightService,
    private readonly poachingIncidentService: PoachingIncidentService,
    private readonly poachingCell: PoachingCellWeightService,
    private readonly regressionService: RegressionService,
    private readonly altitudeService: SRTMService,
  ) {}

  /**
   * Train an animal regressor (predict animal movement) for a given species.
   * Uses animal tracking points in the database
   * @param speciesId The species to train the regressor for
   */
  async trainAnimalRegressor(speciesId: number) {
    const trackingPoints = await this.animalLocationService.getLocationDataBySpeciesId(speciesId);

    const inputData = trackingPoints.map(tp => [
      tp.latitude,
      tp.longitude,
      tp.month,
      tp.time,

      tp.properties.distanceToRivers,
      tp.properties.bearingToRivers,
      tp.properties.distanceToDams,
      tp.properties.bearingToDams,
      tp.properties.distanceToRoads,
      tp.properties.bearingToRoads,
      tp.properties.distanceToResidences,
      tp.properties.bearingToResidences,
      tp.properties.distanceToIntermittentWater,
      tp.properties.bearingToIntermittentWater,

      tp.properties.altitude,
      tp.properties.slopiness,
    ]);
    inputData.pop();

    const outputData = trackingPoints.map(tp => [
      tp.latitude,
      tp.longitude,
    ]);
    outputData.shift();

    await this.regressionService.trainRegressor(this.getAnimalRegressorName(speciesId), inputData, outputData);
  }

  /**
   * Finds the next points for an array of points
   * @param speciesId The ID of the species
   * @param input Series of inputs to predict
   */
  async predictAnimalRegressor(speciesId: number, inputs: Array<{
    latitude: number;
    longitude: number;
    month: number;
    time: number;
  }>) {
    const searchSets = await this.mapService.getFeatureSearchSets();

    let regressor = await this.loadAnimalRegressor(speciesId);
    if (!regressor) {
      // train a new regressor of the regressor does not exist
      await this.trainAnimalRegressor(speciesId);
      regressor = await this.loadAnimalRegressor(speciesId);
    }

    const inputData = [];
    for (const input of inputs) {
      inputData.push(await this.getDistancesForPoint(searchSets, input));
    }

    return regressor.predict(inputData);
  }

  /**
   * Predicts an animal's future position for some given time. Uses the animal's
   * average speed over the last few locations.
   * @param animalId The animal ID
   * @param timeInMinutes How long (in minutes) to predict in future
   * @param startingPoint The starting point of the animal
   */
  async predictFutureAnimalPosition(animalId: string, timeInMinutes: number): Promise<{
    speed: number;
    positions: number[][];
  }> {
    // get the last few positions of the animal so we can predict the next locations
    const lastFewPositions = await this.animalLocationService.getLastFewAnimalLocations(animalId, 20);
    if (lastFewPositions.length <= 1) {
      return undefined;
    }

    // train a regressor off of the last few positions
    const searchSets = await this.mapService.getFeatureSearchSets();
    const lastFewPointsInputs = [];
    for (const pos of lastFewPositions) {
      const point = await this.getDistancesForPoint(searchSets, pos);
      lastFewPointsInputs.push(point);
    }
    const lastFewPointsOutputs = lastFewPointsInputs.slice();
    // we train inputs off of the next point
    lastFewPointsInputs.pop();
    lastFewPointsOutputs.shift();

    const regressor = await this.regressionService.trainAndReturnRegressor(lastFewPointsInputs, lastFewPointsOutputs);

    // the regressor is now trained

    // the latest position of the animal
    const latestPosition = lastFewPositions[lastFewPositions.length - 1];

    // calculate the animal's average speed so we can find the necessary distance
    const averageSpeed = lastFewPositions
      .reduce((sum, position, index) => {
        if (index === lastFewPositions.length - 1) {
          return sum;
        }
        const nextPosition = lastFewPositions[index + 1];

        const distance = getDistance(
          [position.longitude, position.latitude],
          [nextPosition.longitude, nextPosition.latitude],
          { units: 'kilometers' }
        );

        const deltaTimeMinutes = (nextPosition.timestamp.getTime() - position.timestamp.getTime()) / 60000;

        const speed = distance / deltaTimeMinutes;

        return sum + speed;
      }, 0) / (lastFewPositions.length - 1);

    // find how long the animal needes to travel for the time in the future
    const neededDistance = timeInMinutes * averageSpeed;

    // predict a future path for the needed distance
    let elapsedDistance = 0;
    const futurePath = [
      [latestPosition.longitude, latestPosition.latitude],
    ];
    while (elapsedDistance < neededDistance) {
      // use the last point as the input
      const lastPathPoint = futurePath[futurePath.length - 1];
      const pointWithDistances = await this.getDistancesForPoint(searchSets, {
        time: latestPosition.time,
        month: latestPosition.month,
        longitude: lastPathPoint[0],
        latitude: lastPathPoint[1],
      });
      // find the next point
      const nextPoint = regressor.predict([
        pointWithDistances
      ])[0];
      const nextPointCoords = [nextPoint[1], nextPoint[0]];

      // limit distance to how far an elephant can travel in 30 minutes
      const line = lineString([lastPathPoint, nextPointCoords]);
      const along = lineSliceAlong(line, 0, averageSpeed * 30, { units: 'kilometers' });
      const predictedPoint = along.geometry.coordinates[along.geometry.coordinates.length - 1];

      // add the point to the path
      futurePath.push(predictedPoint);

      // find the distance between the predicted point and the previous one
      const distance = getDistance(
        lastPathPoint,
        predictedPoint,
        { units: 'kilometers' },
      );

      elapsedDistance += distance;
      console.log(elapsedDistance);
    }

    return {
      speed: averageSpeed,
      positions: futurePath,
    };
  }

  /**
   * Load a previously saved regressor for a given species
   */
  async loadAnimalRegressor(speciesId: number) {
    return await this.regressionService.loadRegressor(this.getAnimalRegressorName(speciesId));
  }

  private getAnimalRegressorName(speciesId: number) {
    return `species-${speciesId}`;
  }

  /**
   * Train an animal classifier and predict map cells.
   * Saves weights to database for each map cell.
   * @param speciesId The id of the species
   */
  async trainAnimalClassifierModel(speciesId: number) {
    console.log('species id is', speciesId);

    const locationsForSpecies = await this.animalLocationService.getLocationDataBySpeciesId(speciesId);

    if (!locationsForSpecies || !locationsForSpecies.length) {
      console.error('No data for species');
      return;
    }
    console.log('My points',locationsForSpecies.length);
    const teachingData = locationsForSpecies
      .map(tp => ({
        month: tp.month,
        time: tp.time,
        distanceToRivers: tp.properties.distanceToRivers,
        distanceToDams: tp.properties.distanceToDams,
        distanceToRoads: tp.properties.distanceToRoads,
        // distanceToResidences: tp.properties.distanceToResidences,
        distanceToIntermittentWater: tp.properties.distanceToIntermittentWater,
        // altitude: tp.properties.altitude,
        slopiness: tp.properties.slopiness,
      }));


    //  Populate classifier with teaching data
    console.time('Populate Classifier');
    const classifier = new Classifier(teachingData, 200000);
    console.timeEnd('Populate Classifier');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
    console.time('Fetch Cell Data');
    const cellData = await this.mapService.getCellsData();
    console.timeEnd('Fetch Cell Data');

    const month = new Date().getMonth() + 1;
    for (const cell of cellData) {
      const animalCellWeight = {
        cellId: cell.id,
        speciesId,
      };

      for (let i = 0; i < 12; i++) {
        const time = i * 120;
        const cellDistances = {
          month,
          time,
          distanceToRivers: cell.properties.distanceToRivers,
          distanceToDams: cell.properties.distanceToDams,
          distanceToRoads: cell.properties.distanceToRoads,
          distanceToIntermittentWater: cell.properties.distanceToIntermittentWater,
          slopiness: cell.properties.slopiness,
        };
        //console.log('Meant to display',JSON.stringify(cellDistances));
        animalCellWeight[`weight${time}`] = classifier.getDistance(
          cellDistances,
        );
      }

      console.log(`trained cell ${cell.id} / ${cellData.length}`);

      this.animalCellService.addAnimalCellsWeight(animalCellWeight).then(() => {
        console.log(`saved cell ${cell.id} / ${cellData.length}`);
      });
      if (cell.id % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0)); // breathe for a bit to let other functions run
      }
    }
    return true;
  }

  /**
   * Train poaching classifier from poaching incidents data.
   * Then classifies cells and saves weights to the database for each cell.
   */
  async trainPoachingClassifierModel() {
    //  fetch data by species name
    const poachingData = await this.poachingIncidentService.getAllPoachingIncidentTableData();

    const teachingData = poachingData.map(incident => ({
      distanceToRivers: incident.properties.distanceToRivers,
      distanceToDams: incident.properties.distanceToDams,
      distanceToRoads: incident.properties.distanceToRoads,
      distanceToResidences: incident.properties.distanceToResidences,
      distanceToExternalResidences: incident.properties.distanceToExternalResidences,
      slopiness: incident.properties.slopiness,
    }));
    console.log(teachingData);

    //  Populate classifier with teaching data
    console.time('Populate Classifier');
    const classifier = new Classifier(teachingData);
    console.timeEnd('Populate Classifier');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.
    console.time('Fetch Cell Data');
    const cellData = await this.mapService.getCellsData();
    console.timeEnd('Fetch Cell Data');
    //  Once classifier is done being taught we need to fetch all map cell data midpoints from the database.

    for (const cell of cellData) {
      const cellWeight = {
        distanceToRivers: cell.properties.distanceToRivers,
        distanceToDams: cell.properties.distanceToDams,
        distanceToRoads: cell.properties.distanceToRoads,
        distanceToResidences: cell.properties.distanceToResidences,
        distanceToExternalResidences: cell.properties.distanceToExternalResidences,
        slopiness: cell.properties.slopiness,
      };

      const poachingCellWeight = {
        cellId: cell.id,
        weight: classifier.getDistance(cellWeight),
      };

      console.log(`Cell ${cell.id}`);
      await this.poachingCell.addPoachingCellsWeight([poachingCellWeight]);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return true;
  }

  /**
   * Returns an array representation of a point (for input into regressor) with
   * distances and bearings to geographical features applied.
   * @param searchSets The search sets to use (passed to optimise performance)
   * @param input The point to find distances for
   */
  private async getDistancesForPoint(searchSets, input: {
    month: number;
    time: number;
    latitude: number;
    longitude: number;
  }) {
    const altitudeData = await this.altitudeService.getAltitudeForPoint(input.latitude, input.longitude);

    const closestRivers = searchSets[MapFeatureType.rivers].getNearest(input.longitude, input.latitude);
    const closestDams = searchSets[MapFeatureType.dams].getNearest(input.longitude, input.latitude);
    const closestRoads = searchSets[MapFeatureType.roads].getNearest(input.longitude, input.latitude);
    const closestResidences = searchSets[MapFeatureType.residential].getNearest(input.longitude, input.latitude);
    const closestIntermittentWater = searchSets[MapFeatureType.intermittent].getNearest(input.longitude, input.latitude);

    return [
      input.latitude,
      input.longitude,
      input.month,
      input.time,

      closestRivers.distance,
      closestRivers.getBearing(),
      closestDams.distance,
      closestDams.getBearing(),
      closestRoads.distance,
      closestRoads.getBearing(),
      closestResidences.distance,
      closestResidences.getBearing(),
      closestIntermittentWater.distance,
      closestIntermittentWater.getBearing(),

      altitudeData.averageAltitude,
      altitudeData.variance,
    ];
  }
}
