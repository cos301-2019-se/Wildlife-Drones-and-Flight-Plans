import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {AnimalPredictionService} from './providers/animal-prediction.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const model = new AnimalPredictionService(true);
  await app.listen(3000);
}
bootstrap();
