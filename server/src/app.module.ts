import { Module } from '@nestjs/common';

import { controllers } from './app.controllers';
import { providers } from './app.providers';
import { imports } from './app.imports';
import {ModelSaving} from './services/model-saving.service';
@Module({
  imports,
  controllers,
  providers,
  exports: [],
    ModelSaving,
})
export class AppModule {}
