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
  auth: {
    defaultAdminEmail: string;
    defaultAdminPassword: string;
    otp: {
      pattern: string;
      expiryTime: number;
      attempts: number;
    }
  };
  db: {
    type: string | any;
    host: string;
    port: number;
    user: string;
    pass: string;
    database: string;
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
      auth: {
        defaultAdminEmail: process.env.ADMIN_EMAIL,
        defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
        otp: {
          pattern: process.env.OTP_PATTERN,
          expiryTime: parseInt(process.env.OTP_EXPIRES, 10) * 1000,
          attempts: parseInt(process.env.OTP_ATTEMPTS, 10),
        }
      },
      db: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
      }
    };
  }
}
