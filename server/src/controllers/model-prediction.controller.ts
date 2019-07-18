import { Controller, Get, Post, Query } from '@nestjs/common';
import { ModelTraining } from '../services/model-training.service';
@Controller()
export class ModelPrediction {
  constructor(private readonly modelTraining: ModelTraining) {}


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
        slopiness: 9.412820513
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
        slopiness: 5.169230769
      }
     ];
    return this.modelTraining.predictRegressor('Elephant', json);
  }

  @Get('trainElephantModel')
  trainElephantModel(): Promise<boolean> {
    return this.modelTraining.trainRegressorModel('Elephant');
  }

  @Get('trainClassificationModel')
  trainClassificationModel(): Promise<boolean> {
    return this.modelTraining.trainAnimalClassifierModel('Elephant');
  }

    @Get('trainClassificationModelPoaching')
    trainClassificationModelPoaching(): Promise<boolean> {
        return this.modelTraining.trainPoachingClassifierModel();
    }
}
