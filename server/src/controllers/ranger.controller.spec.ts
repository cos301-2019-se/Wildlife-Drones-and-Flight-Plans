import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';

jest.useFakeTimers();
jest.setTimeout(12000000);
let token;
describe('MapController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/addRanger (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addRanger')
      .send({
        lon: '1233.56',
        lat: '6012.45',
        rangerID:'7'
      })
      .expect('true');
  });

  it('/updateRangerLocation (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateRangerLocation')
      .send({
        lon: '32323',
        lat: '1232.0',
        rangerID:'7'
      })
      .expect('true');
  });


});