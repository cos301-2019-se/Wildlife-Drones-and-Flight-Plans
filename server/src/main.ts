import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {AnimalPredictionModel} from './providers/animal-prediction-model';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const model = new AnimalPredictionModel('all-elephant-data.json');
  await app.listen(3000);
}
bootstrap();
