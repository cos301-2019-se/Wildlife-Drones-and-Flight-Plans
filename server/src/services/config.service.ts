import { Injectable } from '@nestjs/common';

export interface Configuration {
  applicationName: string;
  reserveName: string;
  cellSize: number;
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

@Injectable()
export class ConfigService {
  getConfig(): Configuration {
    return {
      applicationName: process.env.APP_NAME,
      reserveName: process.env.RESERVE_NAME,
      cellSize: parseFloat(process.env.CELL_SIZE) / 1000,
      mail: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    };
  }
}
