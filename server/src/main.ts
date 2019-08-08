import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as compression from 'compression';
// somewhere in your initialization file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(compression());
  await app.listen(3000);
}
bootstrap();
