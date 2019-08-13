import { Injectable } from '@nestjs/common';

export interface Configuration {
  reserveName: string;
  cellSize: number;
}

@Injectable()
export class ConfigService {
  async getConfig(): Promise<Configuration> {
    return {
      reserveName: process.env.RESERVE_NAME,
      cellSize: parseFloat(process.env.CELL_SIZE) / 1000,
    };
  }
}
