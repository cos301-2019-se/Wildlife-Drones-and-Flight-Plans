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

  it('/addIncident (POST)', async () => {
    await request(app.getHttpServer())
      .post('/addIncident')
      .send({
        lon: '1233.56',
        lat: '6012.45',
        pType : 'snare',
        description : 'Geskiet met die boog'

      })
      .expect('true');
  });
});
