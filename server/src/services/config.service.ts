import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { ReserveConfiguration } from '../entity/reserve-configuration.entity';

@Injectable()
export class ConfigService {
  constructor(
    private databaseService: DatabaseService,
  ) {}

  async getConfig(): Promise<ReserveConfiguration> {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(ReserveConfiguration);

    const config = (await rep.find())[0];

    return config;
  }

  async setConfig(config: ReserveConfiguration): Promise<void> {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(ReserveConfiguration);

    await rep.save(config);
  }
}
