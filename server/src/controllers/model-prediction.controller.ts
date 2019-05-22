import { Controller, Get, Post,Query } from '@nestjs/common';
import { ModelTraining } from '../services/model-training.service';

@Controller()
export class ModelPrediction {
  constructor(private readonly modelTraining: ModelTraining) {}

  @Get('getPredictionData')
  trainElephantModel(): Promise<JSON> {
    return this.modelTraining.predict('elephant_training_model');
  }

}