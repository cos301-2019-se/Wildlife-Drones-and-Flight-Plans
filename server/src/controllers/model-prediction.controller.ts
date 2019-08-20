import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { ModelTraining } from '../services/model-training.service';
import { AnimalLocationService } from '../services/animal-location.service';
import getDistance from '@turf/distance';
import { convertLength } from '@turf/helpers';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ModelPrediction {
  constructor(
    private readonly modelTraining: ModelTraining,
    private readonly animalLocationsService: AnimalLocationService,
  ) {}

  @Get('getPredictionData')
  getPredictionData(): Promise<JSON> {
    const json = [
      {
        id: 239334,
        animalId: 'AM93',
        timestamp: '30:00.0',
        month: 3,
        time: 210,
        longitude: 31.72069,
        latitude: -24.20746,
        temperature: 23,
        habitat: 'S.birrea/Acacia nirescens open tree savannah',
        distanceToRivers: 8.933100052,
        distanceToDams: 0.000559401,
        distanceToRoads: 0.013392472,
        distanceToResidences: 10.3227469,
        distanceToIntermittentWater: 1.004249513,
        altitude: 308.85,
        slopiness: 9.412820513,
      },
      {
        id: 68025,
        animalId: 'AM110',
        timestamp: '30:00.0',
        month: 8,
        time: 1050,
        longitude: 31.71376,
        latitude: -24.38848,
        temperature: 26,
        habitat: 'Combretum spp/T. sericea woodland',
        distanceToRivers: 5.968999231,
        distanceToDams: 0.000629749,
        distanceToRoads: 0.251953399,
        distanceToResidences: 4.051132049,
        distanceToIntermittentWater: 0.012473533,
        altitude: 300.1,
        slopiness: 5.169230769,
      },
    ];
    return this.modelTraining.predictAnimalRegressor(1, json);
  }

  @Get('getSampleRegression')
  async getSampleRegression() {
    const locations = await this.animalLocationsService.getIndividualAnimalLocationTableData('AM105');

    const inputLocations = locations.slice();
    inputLocations.pop();
    const correctOutputs = locations.slice();
    correctOutputs.shift();

    const outputs = await this.modelTraining.predictAnimalRegressor(1, inputLocations);
    console.log('outputs', outputs.length);
    console.log('correct', correctOutputs.length);

    const distances = correctOutputs.map((animalLocation, index) => {
      const output = [outputs[index][1], outputs[index][0]];
      const distance = getDistance(output, [animalLocation.longitude, animalLocation.latitude], { units: 'kilometers' });
      return {
        input: [inputLocations[index].longitude, inputLocations[index].latitude],
        realOutput: [animalLocation.longitude, animalLocation.latitude],
        predicted: output,
        distance,
      };
    });

    const p25th = distances.sort((a, b) => a.distance - b.distance)[Math.floor(distances.length * 0.25)].distance;
    const p75th = distances.sort((a, b) => a.distance - b.distance)[Math.floor(distances.length * 0.75)].distance;
    const iqr = p75th - p25th;
    const lower = p25th - 1.5 * iqr;
    const upper = p75th + 1.5 * iqr;
    const median = distances.sort((a, b) => a.distance - b.distance)[Math.floor(distances.length / 2)].distance;

    return {
      numUnder50m: distances.reduce((count, d) => d.distance < 0.05 ? count + 1 : count, 0) / distances.length * 100,
      numUnder100m: distances.reduce((count, d) => d.distance < 0.1 ? count + 1 : count, 0) / distances.length * 100,
      numUnder250m: distances.reduce((count, d) => d.distance < 0.25 ? count + 1 : count, 0) / distances.length * 100,
      numUnder500m: distances.reduce((count, d) => d.distance < 0.5 ? count + 1 : count, 0) / distances.length * 100,
      numUnder750m: distances.reduce((count, d) => d.distance < 0.75 ? count + 1 : count, 0) / distances.length * 100,
      numUnder1000m: distances.reduce((count, d) => d.distance < 1 ? count + 1 : count, 0) / distances.length * 100,
      average: distances.reduce((sum, d) => sum + d.distance, 0) / distances.length,
      min: distances.reduce((min, d) => d.distance < min ? d.distance : min, 0),
      max: distances.reduce((max, d) => d.distance > max ? d.distance : max, 0),
      lower,
      p25th,
      median,
      p75th,
      upper,
    };
  }

  @Get('trainClassificationModel')
  trainClassificationModel(
    @Query('species') species: number,
  ): Promise<boolean> {
    console.log('the species id is ', species);
    return this.modelTraining.trainAnimalClassifierModel(species);
  }

  @Get('trainClassificationModelPoaching')
  trainClassificationModelPoaching(): Promise<boolean> {
    return this.modelTraining.trainPoachingClassifierModel();
  }
}
