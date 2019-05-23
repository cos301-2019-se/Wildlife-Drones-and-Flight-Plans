import { Controller, Get, Post,Query } from '@nestjs/common';
import { ModelTraining } from '../services/model-training.service';

@Controller()
export class ModelPrediction {
  constructor(private readonly modelTraining: ModelTraining) {}

  @Get('getPredictionData')
  getPredictionData(): Promise<JSON> {
    return this.modelTraining.predict('elephant_training_model');
  }

  @Get('trainModel')
  trainElephantModel(): Promise<void> {
    return this.modelTraining.trainModel('elephant_training_model');
  }

}