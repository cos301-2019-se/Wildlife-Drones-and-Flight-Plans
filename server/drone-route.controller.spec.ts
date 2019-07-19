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

  it('/addDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addDroneRoute')
      .send({
        id: '1',
        points: '1227906',
      })
      .expect('true');
  });

  it('/updateDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/updateDroneRoute')
      .send({
        id: '2',
        points: '1228900',
        percent: '40'
      })
      .expect('true');
  });

  it('/deactivateDroneRoute (POST)', async () => {
    await request(app.getHttpServer())
      .post('/deactivateDroneRoute')
      .send({
        id: '1',
      })
      .expect('true');
  });

});