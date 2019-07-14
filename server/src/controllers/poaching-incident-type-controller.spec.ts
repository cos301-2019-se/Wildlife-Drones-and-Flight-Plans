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

  it('/addPoachingIncidentType (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addPoachingIncidentType')
      .send({
        poachingType: "bow&arrow"
      })
      .expect('true');
  });
});
